import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  products, InsertProduct,
  wallets, InsertWallet,
  walletTransactions, InsertWalletTransaction,
  paymentSlips, InsertPaymentSlip,
  orders, InsertOrder,
  orderItems, InsertOrderItem,
  siteSettings, InsertSiteSetting,
  bankAccounts, InsertBankAccount
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER QUERIES ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "phone", "address", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(id: number, data: { name?: string; email?: string; phone?: string; address?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(users).set(data).where(eq(users.id, id));
}

// ============ PRODUCT QUERIES ============

export async function getProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.isActive, true));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(product);
  return result;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set({ isActive: false }).where(eq(products.id, id));
}


// ============ WALLET QUERIES ============

export async function getOrCreateWallet(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let wallet = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  
  if (wallet.length === 0) {
    await db.insert(wallets).values({ userId, balance: "0" });
    wallet = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  }
  
  return wallet[0];
}

export async function getWalletBalance(userId: number) {
  const db = await getDb();
  if (!db) return "0";
  const wallet = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  return wallet.length > 0 ? wallet[0].balance : "0";
}

export async function updateWalletBalance(walletId: number, newBalance: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(wallets).set({ balance: newBalance }).where(eq(wallets.id, walletId));
}

export async function deductWalletBalance(userId: number, amount: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const wallet = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  if (wallet.length === 0) return false;
  
  const currentBalance = parseFloat(wallet[0].balance);
  const deductAmount = parseFloat(amount);
  
  if (currentBalance < deductAmount) return false;
  
  const newBalance = (currentBalance - deductAmount).toFixed(2);
  await db.update(wallets).set({ balance: newBalance }).where(eq(wallets.id, wallet[0].id));
  
  // Create transaction record for the purchase
  await db.insert(walletTransactions).values({
    walletId: wallet[0].id,
    type: 'purchase',
    amount: amount,
    status: 'completed',
    description: `Purchase - Deducted ${amount} THB`,
  });
  
  return true;
}

// ============ WALLET TRANSACTION QUERIES ============

export async function createWalletTransaction(transaction: InsertWalletTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(walletTransactions).values(transaction);
  return result;
}

export async function getWalletTransactions(walletId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(walletTransactions).where(eq(walletTransactions.walletId, walletId)).orderBy(desc(walletTransactions.createdAt));
}

export async function updateTransactionStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(walletTransactions).set({ status: status as any }).where(eq(walletTransactions.id, id));
}

// ============ PAYMENT SLIP QUERIES ============

export async function createPaymentSlip(slip: InsertPaymentSlip) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(paymentSlips).values(slip);
  return result;
}

export async function getPaymentSlip(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(paymentSlips).where(eq(paymentSlips.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPendingPaymentSlips() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentSlips).where(eq(paymentSlips.status, "pending")).orderBy(desc(paymentSlips.createdAt));
}

export async function updatePaymentSlipStatus(id: number, status: string, rejectionReason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { status: status as any };
  if (rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }
  return db.update(paymentSlips).set(updateData).where(eq(paymentSlips.id, id));
}

// ============ ORDER QUERIES ============

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(order);
  // Get the inserted order to return it with the ID
  if (order.orderNumber) {
    const inserted = await getOrderByNumber(order.orderNumber);
    if (inserted) {
      return { insertId: inserted.id, ...inserted };
    }
  }
  return result;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  
  // Fetch user data for each order
  const ordersWithUsers = await Promise.all(
    allOrders.map(async (order) => {
      const user = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
      return {
        ...order,
        user: user[0] || null,
      };
    })
  );
  
  return ordersWithUsers;
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
}

// ============ ORDER ITEM QUERIES ============

export async function createOrderItem(item: InsertOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orderItems).values(item);
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// ============ SITE SETTINGS QUERIES ============

export async function getSiteSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllSiteSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteSettings);
}

export async function upsertSiteSetting(key: string, value: string, type: string = "string") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSiteSetting(key);
  if (existing) {
    return db.update(siteSettings).set({ value, type: type as any }).where(eq(siteSettings.key, key));
  } else {
    return db.insert(siteSettings).values({ key, value, type: type as any });
  }
}

// ============ BANK ACCOUNT QUERIES ============

export async function getActiveBankAccounts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bankAccounts).where(eq(bankAccounts.isActive, true));
}

export async function getBankAccountById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bankAccounts).where(eq(bankAccounts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBankAccount(account: InsertBankAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(bankAccounts).values(account);
}

export async function updateBankAccount(id: number, data: Partial<InsertBankAccount>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(bankAccounts).set(data).where(eq(bankAccounts.id, id));
}
export async function reduceProductStock(productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product.length) throw new Error("Product not found");
  const currentStock = typeof product[0].stock === 'string' ? parseInt(product[0].stock) : (product[0].stock || 0);
  const newStock = Math.max(0, currentStock - quantity);
  return db.update(products).set({ stock: newStock }).where(eq(products.id, productId));
}
