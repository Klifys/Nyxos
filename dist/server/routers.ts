import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { orders, walletTransactions, bankAccounts } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

import { verifyPaymentSlip, validateSlipData } from "./slipVerification";
import { generateOrderConfirmationEmail, generateOrderStatusEmail, generatePaymentVerificationEmail, sendEmail } from "./emailNotifications";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  // ============ AUTH ROUTES ============
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ============ PRODUCT ROUTES ============
  products: router({
    list: publicProcedure.query(async () => {
      return db.getProducts();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getProductById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.string(),
        discount: z.number().optional(),
        stock: z.number(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createProduct(input);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        discount: z.number().optional(),
        stock: z.number().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateProduct(id, data);
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteProduct(input.id);
      }),
  }),

  // ============ WALLET ROUTES ============
  wallet: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const wallet = await db.getOrCreateWallet(ctx.user.id);
      return { balance: wallet.balance };
    }),
    
    getTransactions: protectedProcedure.query(async ({ ctx }) => {
      const wallet = await db.getOrCreateWallet(ctx.user.id);
      return db.getWalletTransactions(wallet.id);
    }),
    
    initiateTopup: protectedProcedure
      .input(z.object({ amount: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const wallet = await db.getOrCreateWallet(ctx.user.id);
        
        const transaction = await db.createWalletTransaction({
          walletId: wallet.id,
          type: "topup",
          amount: input.amount,
          status: "pending",
          description: `Top-up ${input.amount} THB`,
        });
        
        const transactionId = (transaction as any).insertId || 0;
        return { transactionId, status: "pending" };
      }),
  }),

  // ============ PAYMENT SLIP ROUTES ============
  paymentSlip: router({
    upload: protectedProcedure
      .input(z.object({
        transactionId: z.number(),
        imageUrl: z.string(),
        imageKey: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const slip = await db.createPaymentSlip({
          walletTransactionId: input.transactionId,
          userId: ctx.user.id,
          imageUrl: input.imageUrl,
          imageKey: input.imageKey,
          status: "pending",
        });
        
        const slipId = (slip as any).insertId || 0;
        return { slipId, status: "pending" };
      }),
    
    getStatus: protectedProcedure
      .input(z.object({ slipId: z.number() }))
      .query(async ({ input }) => {
        return db.getPaymentSlip(input.slipId);
      }),
    
    getPending: adminProcedure.query(async () => {
      return db.getPendingPaymentSlips();
    }),
    
    verify: adminProcedure
      .input(z.object({
        slipId: z.number(),
        status: z.enum(["verified", "rejected"]),
        rejectionReason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const slip = await db.getPaymentSlip(input.slipId);
        if (!slip) throw new TRPCError({ code: 'NOT_FOUND' });
        
        await db.updatePaymentSlipStatus(input.slipId, input.status, input.rejectionReason);
        
        if (input.status === "verified") {
          const transaction = await db.getDb().then(db => 
            db?.select().from(require("../drizzle/schema").walletTransactions)
              .where(require("drizzle-orm").eq(require("../drizzle/schema").walletTransactions.id, slip.walletTransactionId))
              .limit(1)
          );
          
          if (transaction && transaction[0]) {
            const wallet = await db.getOrCreateWallet(slip.userId);
            const newBalance = (parseFloat(wallet.balance) + parseFloat(transaction[0].amount)).toString();
            await db.updateWalletBalance(wallet.id, newBalance);
            await db.updateTransactionStatus(slip.walletTransactionId, "completed");
          }
        }
        
        return { success: true };
      }),
  }),

  // ============ ORDER ROUTES ============
  orders: router({
    create: protectedProcedure
      .input(z.object({
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          price: z.string(),
        })),
        checkoutMode: z.enum(["standard", "custom_address"]),
        shippingAddress: z.string().optional(),
        shippingPhone: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const orderNumber = `ORD-${Date.now()}-${nanoid(6)}`;
        const totalAmount = input.items.reduce((sum, item) => 
          sum + (parseFloat(item.price) * item.quantity), 0
        ).toString();
        
        // Deduct wallet balance first
        const deducted = await db.deductWalletBalance(ctx.user.id, totalAmount);
        if (!deducted) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'Insufficient wallet balance' 
          });
        }
        
        const order = await db.createOrder({
          userId: ctx.user.id,
          orderNumber,
          totalAmount,
          checkoutMode: input.checkoutMode,
          shippingAddress: input.shippingAddress,
          shippingPhone: input.shippingPhone,
          notes: input.notes,
          status: "pending",
        });
        
        const orderId = (order as any).insertId || 0;
        for (const item of input.items) {
          await db.createOrderItem({
            orderId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          });
          // Reduce product stock
          await db.reduceProductStock(item.productId, item.quantity);
        }
        
        return { orderId, orderNumber, totalAmount };
      }),
    
    getById: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order || (order.userId !== ctx.user.id && ctx.user.role !== 'admin')) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        const items = await db.getOrderItems(input.orderId);
        return { ...order, items };
      }),
    
    getUserOrders: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserOrders(ctx.user.id);
    }),
    
    getAllOrders: adminProcedure.query(async () => {
      return db.getAllOrders();
    }),
    
    updateStatus: adminProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        return db.updateOrderStatus(input.orderId, input.status);
      }),
  }),

  // ============ SITE SETTINGS ROUTES ============
  settings: router({
    getAll: publicProcedure.query(async () => {
      return db.getAllSiteSettings();
    }),
    
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return db.getSiteSetting(input.key);
      }),
    
    update: adminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
        type: z.enum(["string", "number", "boolean", "json"]).optional(),
      }))
      .mutation(async ({ input }) => {
        return db.upsertSiteSetting(input.key, input.value, input.type);
      }),
  }),

  // ============ BANK ACCOUNT ROUTES ============

  // ============ SLIP VERIFICATION ROUTES (NEW) ============
  autoVerifySlip: adminProcedure
    .input(z.object({ slipId: z.number(), imageUrl: z.string() }))
    .mutation(async ({ input }) => {
      const extracted = await verifyPaymentSlip(input.imageUrl);
      const slip = await db.getPaymentSlip(input.slipId);
      if (!slip) throw new TRPCError({ code: 'NOT_FOUND' });
      return { success: true, extracted, autoVerified: extracted.isValid };
    }),

  // ============ EMAIL NOTIFICATION ROUTES (NEW) ============
  sendOrderConfirmation: adminProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ input }) => {
      const order = await db.getOrderById(input.orderId);
      if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
      const user = await db.getUserById(order.userId);
      if (!user || !user.email) throw new TRPCError({ code: 'NOT_FOUND' });
      const items = await db.getOrderItems(order.id);
      const template = generateOrderConfirmationEmail(order.orderNumber, user.name || "Customer", order.totalAmount.toString(), items.map(item => ({ name: `Product ${item.productId}`, quantity: item.quantity, price: item.price.toString() })));
      return sendEmail(user.email, template);
    }),

  sendOrderStatusUpdate: adminProcedure
    .input(z.object({ orderId: z.number(), status: z.enum(["confirmed", "processing", "shipped", "delivered", "cancelled"]), trackingNumber: z.string().optional() }))
    .mutation(async ({ input }) => {
      const order = await db.getOrderById(input.orderId);
      if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
      const user = await db.getUserById(order.userId);
      if (!user || !user.email) throw new TRPCError({ code: 'NOT_FOUND' });
      const template = generateOrderStatusEmail(order.orderNumber, user.name || "Customer", input.status, input.trackingNumber);
      return sendEmail(user.email, template);
    }),

  // ============ PRODUCT IMAGE UPLOAD ROUTES (NEW) ============
  uploadImage: adminProcedure
    .input(z.object({ productId: z.number(), imageBase64: z.string(), fileName: z.string() }))
    .mutation(async ({ input }) => {
      const { storagePut } = await import("../server/storage");
      const { products } = await import("../drizzle/schema");
      const buffer = Buffer.from(input.imageBase64, 'base64');
      const fileKey = `products/${input.productId}-${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, 'image/jpeg');
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database not available");
      await dbInstance.update(products).set({ imageUrl: url, imageKey: fileKey }).where(eq(products.id, input.productId));
      return { success: true, url, fileKey };
    }),

  deleteImage: adminProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database not available");
      const { products } = await import("../drizzle/schema");
      await dbInstance.update(products).set({ imageUrl: null, imageKey: null }).where(eq(products.id, input.productId));
      return { success: true };
    }),

  // ============ ORDER ITEMS MANAGEMENT ROUTES (NEW) ============
  addItem: adminProcedure
    .input(z.object({ orderId: z.number(), productId: z.number(), quantity: z.number().min(1), price: z.string() }))
    .mutation(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database not available");
      const { orderItems } = require("../drizzle/schema");
      const result = await dbInstance.insert(orderItems).values({ orderId: input.orderId, productId: input.productId, quantity: input.quantity, price: parseFloat(input.price) });
      return { success: true, itemId: result[0] };
    }),

  removeItem: adminProcedure
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database not available");
      const { orderItems } = require("../drizzle/schema");
      const { eq } = require("drizzle-orm");
      await dbInstance.delete(orderItems).where(eq(orderItems.id, input.itemId));
      return { success: true };
    }),

  updateItem: adminProcedure
    .input(z.object({ itemId: z.number(), quantity: z.number().min(1).optional(), price: z.string().optional() }))
    .mutation(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database not available");
      const { orderItems } = require("../drizzle/schema");
      const { eq } = require("drizzle-orm");
      const updateData: any = {};
      if (input.quantity) updateData.quantity = input.quantity;
      if (input.price) updateData.price = parseFloat(input.price);
      await dbInstance.update(orderItems).set(updateData).where(eq(orderItems.id, input.itemId));
      return { success: true };
    }),

  // ============ CANCEL ORDER ROUTES (NEW) ============
  cancelOrder: adminProcedure
    .input(z.object({ orderId: z.number(), reason: z.string() }))
    .mutation(async ({ input }) => {
      const order = await db.getOrderById(input.orderId);
      if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database not available");
      await dbInstance.update(orders).set({ status: "cancelled", cancellationReason: input.reason }).where(eq(orders.id, input.orderId));
      const user = await db.getUserById(order.userId);
      if (user && user.email) {
        const template = generateOrderStatusEmail(order.orderNumber, user.name || "Customer", "cancelled");
        await sendEmail(user.email, template);
      }
      return { success: true };
    }),

  // ============ TRANSACTION HISTORY MANAGEMENT ROUTES (NEW) ============
  getTransactionHistory: adminProcedure
    .input(z.object({ userId: z.number().optional(), status: z.string().optional(), limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database not available");
      const conditions: any[] = [];
      if (input.userId) conditions.push(eq(walletTransactions.walletId, input.userId));
      if (input.status) conditions.push(eq(walletTransactions.status, input.status as any));
      
      let baseQuery = dbInstance.select().from(walletTransactions);
      const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
      const transactions = await (query as any).orderBy(desc(walletTransactions.createdAt)).limit(input.limit).offset(input.offset);
      return transactions;
    }),

  verifyTransaction: adminProcedure
    .input(z.object({ transactionId: z.number() }))
    .mutation(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database not available");
      const { wallets } = await import("../drizzle/schema");
      const transaction = await dbInstance.select().from(walletTransactions).where(eq(walletTransactions.id, input.transactionId)).limit(1);
      if (!transaction || !transaction[0]) throw new TRPCError({ code: 'NOT_FOUND' });
      await dbInstance.update(walletTransactions).set({ status: "completed" }).where(eq(walletTransactions.id, input.transactionId));
      const wallet = await dbInstance.select().from(wallets).where(eq(wallets.id, transaction[0].walletId)).limit(1);
      if (wallet && wallet[0]) {
        const newBalance = (parseFloat(wallet[0].balance) + parseFloat(transaction[0].amount.toString())).toString();
        await dbInstance.update(wallets).set({ balance: newBalance }).where(eq(wallets.id, transaction[0].walletId));
      }
      return { success: true };
    }),

  rejectTransaction: adminProcedure
    .input(z.object({ transactionId: z.number(), reason: z.string() }))
    .mutation(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database not available");
      await dbInstance.update(walletTransactions).set({ status: "rejected", notes: input.reason }).where(eq(walletTransactions.id, input.transactionId));
      return { success: true };
    }),
  bankAccounts: router({
    getActive: publicProcedure.query(async () => {
      return db.getActiveBankAccounts();
    }),
    
    getAll: adminProcedure.query(async () => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      return dbInstance.select().from(bankAccounts);
    }),
    
    create: adminProcedure
      .input(z.object({
        bankName: z.string(),
        accountNumber: z.string(),
        accountName: z.string(),
        qrCode: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createBankAccount(input);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        bankName: z.string().optional(),
        accountNumber: z.string().optional(),
        accountName: z.string().optional(),
        qrCode: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateBankAccount(id, data);
      }),
  }),
});

export type AppRouter = typeof appRouter;
