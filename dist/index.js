var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc3) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc3 = __getOwnPropDesc(from, key)) || desc3.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  bankAccounts: () => bankAccounts,
  orderItems: () => orderItems,
  orders: () => orders,
  paymentSlips: () => paymentSlips,
  products: () => products,
  siteSettings: () => siteSettings,
  users: () => users,
  walletTransactions: () => walletTransactions,
  wallets: () => wallets
});
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, longtext } from "drizzle-orm/mysql-core";
var users, products, wallets, walletTransactions, paymentSlips, orders, orderItems, siteSettings, bankAccounts;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      id: int("id").autoincrement().primaryKey(),
      openId: varchar("openId", { length: 64 }).unique(),
      username: varchar("username", { length: 100 }).unique(),
      passwordHash: varchar("passwordHash", { length: 255 }),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      phone: varchar("phone", { length: 20 }),
      address: text("address"),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    products = mysqlTable("products", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      price: decimal("price", { precision: 10, scale: 2 }).notNull(),
      discount: int("discount").default(0).notNull(),
      stock: int("stock").notNull().default(0),
      imageUrl: text("imageUrl"),
      imageKey: varchar("imageKey", { length: 255 }),
      category: varchar("category", { length: 100 }),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    wallets = mysqlTable("wallets", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id),
      balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default("0"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    walletTransactions = mysqlTable("wallet_transactions", {
      id: int("id").autoincrement().primaryKey(),
      walletId: int("walletId").notNull().references(() => wallets.id),
      type: mysqlEnum("type", ["topup", "purchase", "refund"]).notNull(),
      amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
      description: text("description"),
      status: mysqlEnum("status", ["pending", "completed", "failed", "rejected"]).default("pending").notNull(),
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    paymentSlips = mysqlTable("payment_slips", {
      id: int("id").autoincrement().primaryKey(),
      walletTransactionId: int("walletTransactionId").notNull().references(() => walletTransactions.id),
      userId: int("userId").notNull().references(() => users.id),
      imageUrl: text("imageUrl"),
      imageKey: varchar("imageKey", { length: 255 }),
      extractedData: longtext("extractedData"),
      // JSON string with extracted transaction details
      status: mysqlEnum("status", ["pending", "verified", "rejected"]).default("pending").notNull(),
      rejectionReason: text("rejectionReason"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    orders = mysqlTable("orders", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id),
      orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
      totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
      status: mysqlEnum("status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
      checkoutMode: mysqlEnum("checkoutMode", ["standard", "custom_address"]).notNull(),
      shippingAddress: text("shippingAddress"),
      shippingPhone: varchar("shippingPhone", { length: 20 }),
      notes: text("notes"),
      cancellationReason: text("cancellationReason"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    orderItems = mysqlTable("order_items", {
      id: int("id").autoincrement().primaryKey(),
      orderId: int("orderId").notNull().references(() => orders.id),
      productId: int("productId").notNull().references(() => products.id),
      quantity: int("quantity").notNull(),
      price: decimal("price", { precision: 10, scale: 2 }).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    siteSettings = mysqlTable("site_settings", {
      id: int("id").autoincrement().primaryKey(),
      key: varchar("key", { length: 100 }).notNull().unique(),
      value: longtext("value"),
      type: mysqlEnum("type", ["string", "number", "boolean", "json"]).default("string").notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    bankAccounts = mysqlTable("bank_accounts", {
      id: int("id").autoincrement().primaryKey(),
      bankName: varchar("bankName", { length: 100 }).notNull(),
      accountNumber: varchar("accountNumber", { length: 50 }).notNull(),
      accountName: varchar("accountName", { length: 255 }).notNull(),
      qrCode: text("qrCode"),
      // Data URL for QR code
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  storageGet: () => storageGet,
  storagePut: () => storagePut
});
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
async function buildDownloadUrl(baseUrl, relKey, apiKey) {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey)
  });
  return (await response.json()).url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}
async function storageGet(relKey) {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey)
  };
}
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_env();
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
init_schema();
init_env();
import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
var _db = null;
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "phone", "address", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateUserProfile(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(users).set(data).where(eq(users.id, id));
}
async function getProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.isActive, true));
}
async function getProductById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createProduct(product) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(product);
  return result;
}
async function updateProduct(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(data).where(eq(products.id, id));
}
async function deleteProduct(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set({ isActive: false }).where(eq(products.id, id));
}
async function getOrCreateWallet(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let wallet = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  if (wallet.length === 0) {
    await db.insert(wallets).values({ userId, balance: "0" });
    wallet = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  }
  return wallet[0];
}
async function updateWalletBalance(walletId, newBalance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(wallets).set({ balance: newBalance }).where(eq(wallets.id, walletId));
}
async function deductWalletBalance(userId, amount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const wallet = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  if (wallet.length === 0) return false;
  const currentBalance = parseFloat(wallet[0].balance);
  const deductAmount = parseFloat(amount);
  if (currentBalance < deductAmount) return false;
  const newBalance = (currentBalance - deductAmount).toFixed(2);
  await db.update(wallets).set({ balance: newBalance }).where(eq(wallets.id, wallet[0].id));
  await db.insert(walletTransactions).values({
    walletId: wallet[0].id,
    type: "purchase",
    amount,
    status: "completed",
    description: `Purchase - Deducted ${amount} THB`
  });
  return true;
}
async function createWalletTransaction(transaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(walletTransactions).values(transaction);
  return result;
}
async function getWalletTransactions(walletId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(walletTransactions).where(eq(walletTransactions.walletId, walletId)).orderBy(desc(walletTransactions.createdAt));
}
async function updateTransactionStatus(id, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(walletTransactions).set({ status }).where(eq(walletTransactions.id, id));
}
async function createPaymentSlip(slip) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(paymentSlips).values(slip);
  return result;
}
async function getPaymentSlip(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(paymentSlips).where(eq(paymentSlips.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getPendingPaymentSlips() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentSlips).where(eq(paymentSlips.status, "pending")).orderBy(desc(paymentSlips.createdAt));
}
async function updatePaymentSlipStatus(id, status, rejectionReason) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData = { status };
  if (rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }
  return db.update(paymentSlips).set(updateData).where(eq(paymentSlips.id, id));
}
async function createOrder(order) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(order);
  if (order.orderNumber) {
    const inserted = await getOrderByNumber(order.orderNumber);
    if (inserted) {
      return { insertId: inserted.id, ...inserted };
    }
  }
  return result;
}
async function getOrderById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getOrderByNumber(orderNumber) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserOrders(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}
async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const ordersWithUsers = await Promise.all(
    allOrders.map(async (order) => {
      const user = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
      return {
        ...order,
        user: user[0] || null
      };
    })
  );
  return ordersWithUsers;
}
async function updateOrderStatus(id, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set({ status }).where(eq(orders.id, id));
}
async function createOrderItem(item) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orderItems).values(item);
}
async function getOrderItems(orderId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}
async function getSiteSetting(key) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAllSiteSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteSettings);
}
async function upsertSiteSetting(key, value, type = "string") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getSiteSetting(key);
  if (existing) {
    return db.update(siteSettings).set({ value, type }).where(eq(siteSettings.key, key));
  } else {
    return db.insert(siteSettings).values({ key, value, type });
  }
}
async function getActiveBankAccounts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bankAccounts).where(eq(bankAccounts.isActive, true));
}
async function createBankAccount(account) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(bankAccounts).values(account);
}
async function updateBankAccount(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(bankAccounts).set(data).where(eq(bankAccounts.id, id));
}
async function reduceProductStock(productId, quantity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product.length) throw new Error("Product not found");
  const currentStock = typeof product[0].stock === "string" ? parseInt(product[0].stock) : product[0].stock || 0;
  const newStock = Math.max(0, currentStock - quantity);
  return db.update(products).set({ stock: newStock }).where(eq(products.id, productId));
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
init_env();
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";
init_schema();
import { TRPCError as TRPCError3 } from "@trpc/server";
import { nanoid } from "nanoid";
import { eq as eq2, and as and2, desc as desc2 } from "drizzle-orm";

// server/_core/llm.ts
init_env();
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 32768;
  payload.thinking = {
    "budget_tokens": 128
  };
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/slipVerification.ts
async function verifyPaymentSlip(imageUrl) {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "You are an expert at reading Thai bank transfer slips (\u0E2A\u0E25\u0E34\u0E1B\u0E42\u0E2D\u0E19\u0E40\u0E07\u0E34\u0E19). Extract the following information from the slip image: Amount (\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E07\u0E34\u0E19), Date (\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48), Bank name (\u0E0A\u0E37\u0E48\u0E2D\u0E18\u0E19\u0E32\u0E04\u0E32\u0E23), Sender name (\u0E0A\u0E37\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E42\u0E2D\u0E19), Sender account (\u0E40\u0E25\u0E02\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E1C\u0E39\u0E49\u0E42\u0E2D\u0E19), Recipient name (\u0E0A\u0E37\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E23\u0E31\u0E1A), Recipient account (\u0E40\u0E25\u0E02\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E1C\u0E39\u0E49\u0E23\u0E31\u0E1A), Reference number (\u0E40\u0E25\u0E02\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07). Return a JSON object with these fields. If you cannot read a field clearly, set it to null. Also include a 'confidence' field: 'high' if all fields are clear, 'medium' if some are unclear, 'low' if mostly unclear. Include an 'isValid' boolean: true if this looks like a legitimate bank slip. Include an 'errors' array with any issues found."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "slip_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              amount: { type: ["string", "null"], description: "Transfer amount" },
              date: { type: ["string", "null"], description: "Transfer date" },
              bankName: { type: ["string", "null"], description: "Bank name" },
              senderName: { type: ["string", "null"], description: "Sender name" },
              senderAccount: { type: ["string", "null"], description: "Sender account number" },
              recipientName: { type: ["string", "null"], description: "Recipient name" },
              recipientAccount: { type: ["string", "null"], description: "Recipient account number" },
              referenceNumber: { type: ["string", "null"], description: "Reference number" },
              confidence: { type: "string", enum: ["high", "medium", "low"], description: "Confidence level" },
              isValid: { type: "boolean", description: "Whether this appears to be a valid bank slip" },
              errors: { type: "array", items: { type: "string" }, description: "Any issues found" }
            },
            required: ["amount", "date", "bankName", "senderName", "senderAccount", "recipientName", "recipientAccount", "referenceNumber", "confidence", "isValid", "errors"],
            additionalProperties: false
          }
        }
      }
    });
    const content = response.choices[0].message.content;
    if (typeof content !== "string") {
      throw new Error("Unexpected response format from LLM");
    }
    const parsed = JSON.parse(content);
    return parsed;
  } catch (error) {
    console.error("[SlipVerification] Error verifying slip:", error);
    return {
      amount: null,
      date: null,
      bankName: null,
      senderName: null,
      senderAccount: null,
      recipientName: null,
      recipientAccount: null,
      referenceNumber: null,
      confidence: "low",
      isValid: false,
      errors: [error instanceof Error ? error.message : "Unknown error during verification"]
    };
  }
}

// server/emailNotifications.ts
function generateOrderConfirmationEmail(orderNumber, customerName, totalAmount, items) {
  const itemsHtml = items.map((item) => `<tr><td style="padding: 8px;">${item.name}</td><td style="text-align: center;">${item.quantity}</td><td style="text-align: right;">\u0E3F${item.price}</td></tr>`).join("");
  return {
    subject: `\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E01\u0E32\u0E23\u0E2A\u0E31\u0E48\u0E07\u0E0B\u0E37\u0E49\u0E2D - ${orderNumber}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px;"><h2 style="color: #ea580c;">\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E01\u0E32\u0E23\u0E2A\u0E31\u0E48\u0E07\u0E0B\u0E37\u0E49\u0E2D</h2><p>\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35 ${customerName},</p><p><strong>\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48\u0E2D\u0E2D\u0E40\u0E14\u0E2D\u0E23\u0E4C:</strong> ${orderNumber}</p><table style="width: 100%; border-collapse: collapse;">${itemsHtml}</table><p><strong>\u0E23\u0E27\u0E21: \u0E3F${totalAmount}</strong></p></div>`,
    text: `\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E01\u0E32\u0E23\u0E2A\u0E31\u0E48\u0E07\u0E0B\u0E37\u0E49\u0E2D
\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48\u0E2D\u0E2D\u0E40\u0E14\u0E2D\u0E23\u0E4C: ${orderNumber}
\u0E23\u0E27\u0E21: \u0E3F${totalAmount}`
  };
}
function generateOrderStatusEmail(orderNumber, customerName, status, trackingNumber) {
  const messages = {
    confirmed: "\u0E2D\u0E2D\u0E40\u0E14\u0E2D\u0E23\u0E4C\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E41\u0E25\u0E49\u0E27",
    processing: "\u0E40\u0E23\u0E32\u0E01\u0E33\u0E25\u0E31\u0E07\u0E40\u0E15\u0E23\u0E35\u0E22\u0E21\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32",
    shipped: "\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E44\u0E14\u0E49\u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01\u0E41\u0E25\u0E49\u0E27",
    delivered: "\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E44\u0E14\u0E49\u0E2A\u0E48\u0E07\u0E16\u0E36\u0E07\u0E41\u0E25\u0E49\u0E27",
    cancelled: "\u0E2D\u0E2D\u0E40\u0E14\u0E2D\u0E23\u0E4C\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E44\u0E14\u0E49\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01\u0E41\u0E25\u0E49\u0E27",
    pending: "\u0E2D\u0E2D\u0E40\u0E14\u0E2D\u0E23\u0E4C\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E23\u0E2D\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23"
  };
  return {
    subject: `\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E2D\u0E2D\u0E40\u0E14\u0E2D\u0E23\u0E4C - ${orderNumber}`,
    html: `<div style="font-family: Arial, sans-serif;"><h2 style="color: #ea580c;">\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E2D\u0E2D\u0E40\u0E14\u0E2D\u0E23\u0E4C</h2><p>\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48\u0E2D\u0E2D\u0E40\u0E14\u0E2D\u0E23\u0E4C: ${orderNumber}</p><p>${messages[status]}</p>${trackingNumber ? `<p>\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21: ${trackingNumber}</p>` : ""}</div>`,
    text: `\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E2D\u0E2D\u0E40\u0E14\u0E2D\u0E23\u0E4C
\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48\u0E2D\u0E2D\u0E40\u0E14\u0E2D\u0E23\u0E4C: ${orderNumber}
${messages[status]}${trackingNumber ? `
\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21: ${trackingNumber}` : ""}`
  };
}
async function sendEmail(to, template) {
  try {
    console.log(`[Email] Sending to ${to}: ${template.subject}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// server/routers.ts
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError3({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});
var appRouter = router({
  system: systemRouter,
  // ============ AUTH ROUTES ============
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    updateProfile: protectedProcedure.input(z2.object({
      name: z2.string().optional(),
      email: z2.string().optional(),
      phone: z2.string().optional(),
      address: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, input);
      return { success: true };
    })
  }),
  // ============ PRODUCT ROUTES ============
  products: router({
    list: publicProcedure.query(async () => {
      return getProducts();
    }),
    getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getProductById(input.id);
    }),
    create: adminProcedure2.input(z2.object({
      name: z2.string(),
      description: z2.string().optional(),
      price: z2.string(),
      discount: z2.number().optional(),
      stock: z2.number(),
      imageUrl: z2.string().optional(),
      imageKey: z2.string().optional(),
      category: z2.string().optional()
    })).mutation(async ({ input }) => {
      return createProduct(input);
    }),
    update: adminProcedure2.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      description: z2.string().optional(),
      price: z2.string().optional(),
      discount: z2.number().optional(),
      stock: z2.number().optional(),
      imageUrl: z2.string().optional(),
      imageKey: z2.string().optional(),
      category: z2.string().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateProduct(id, data);
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      return deleteProduct(input.id);
    })
  }),
  // ============ WALLET ROUTES ============
  wallet: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const wallet = await getOrCreateWallet(ctx.user.id);
      return { balance: wallet.balance };
    }),
    getTransactions: protectedProcedure.query(async ({ ctx }) => {
      const wallet = await getOrCreateWallet(ctx.user.id);
      return getWalletTransactions(wallet.id);
    }),
    initiateTopup: protectedProcedure.input(z2.object({ amount: z2.string() })).mutation(async ({ ctx, input }) => {
      const wallet = await getOrCreateWallet(ctx.user.id);
      const transaction = await createWalletTransaction({
        walletId: wallet.id,
        type: "topup",
        amount: input.amount,
        status: "pending",
        description: `Top-up ${input.amount} THB`
      });
      const transactionId = transaction.insertId || 0;
      return { transactionId, status: "pending" };
    })
  }),
  // ============ PAYMENT SLIP ROUTES ============
  paymentSlip: router({
    upload: protectedProcedure.input(z2.object({
      transactionId: z2.number(),
      imageUrl: z2.string(),
      imageKey: z2.string()
    })).mutation(async ({ ctx, input }) => {
      const slip = await createPaymentSlip({
        walletTransactionId: input.transactionId,
        userId: ctx.user.id,
        imageUrl: input.imageUrl,
        imageKey: input.imageKey,
        status: "pending"
      });
      const slipId = slip.insertId || 0;
      return { slipId, status: "pending" };
    }),
    getStatus: protectedProcedure.input(z2.object({ slipId: z2.number() })).query(async ({ input }) => {
      return getPaymentSlip(input.slipId);
    }),
    getPending: adminProcedure2.query(async () => {
      return getPendingPaymentSlips();
    }),
    verify: adminProcedure2.input(z2.object({
      slipId: z2.number(),
      status: z2.enum(["verified", "rejected"]),
      rejectionReason: z2.string().optional()
    })).mutation(async ({ input }) => {
      const slip = await getPaymentSlip(input.slipId);
      if (!slip) throw new TRPCError3({ code: "NOT_FOUND" });
      await updatePaymentSlipStatus(input.slipId, input.status, input.rejectionReason);
      if (input.status === "verified") {
        const transaction = await getDb().then(
          (db) => db?.select().from((init_schema(), __toCommonJS(schema_exports)).walletTransactions).where(__require("drizzle-orm").eq((init_schema(), __toCommonJS(schema_exports)).walletTransactions.id, slip.walletTransactionId)).limit(1)
        );
        if (transaction && transaction[0]) {
          const wallet = await getOrCreateWallet(slip.userId);
          const newBalance = (parseFloat(wallet.balance) + parseFloat(transaction[0].amount)).toString();
          await updateWalletBalance(wallet.id, newBalance);
          await updateTransactionStatus(slip.walletTransactionId, "completed");
        }
      }
      return { success: true };
    })
  }),
  // ============ ORDER ROUTES ============
  orders: router({
    create: protectedProcedure.input(z2.object({
      items: z2.array(z2.object({
        productId: z2.number(),
        quantity: z2.number(),
        price: z2.string()
      })),
      checkoutMode: z2.enum(["standard", "custom_address"]),
      shippingAddress: z2.string().optional(),
      shippingPhone: z2.string().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const orderNumber = `ORD-${Date.now()}-${nanoid(6)}`;
      const totalAmount = input.items.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0
      ).toString();
      const deducted = await deductWalletBalance(ctx.user.id, totalAmount);
      if (!deducted) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "Insufficient wallet balance"
        });
      }
      const order = await createOrder({
        userId: ctx.user.id,
        orderNumber,
        totalAmount,
        checkoutMode: input.checkoutMode,
        shippingAddress: input.shippingAddress,
        shippingPhone: input.shippingPhone,
        notes: input.notes,
        status: "pending"
      });
      const orderId = order.insertId || 0;
      for (const item of input.items) {
        await createOrderItem({
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        });
        await reduceProductStock(item.productId, item.quantity);
      }
      return { orderId, orderNumber, totalAmount };
    }),
    getById: protectedProcedure.input(z2.object({ orderId: z2.number() })).query(async ({ ctx, input }) => {
      const order = await getOrderById(input.orderId);
      if (!order || order.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN" });
      }
      const items = await getOrderItems(input.orderId);
      return { ...order, items };
    }),
    getUserOrders: protectedProcedure.query(async ({ ctx }) => {
      return getUserOrders(ctx.user.id);
    }),
    getAllOrders: adminProcedure2.query(async () => {
      return getAllOrders();
    }),
    updateStatus: adminProcedure2.input(z2.object({
      orderId: z2.number(),
      status: z2.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"])
    })).mutation(async ({ input }) => {
      return updateOrderStatus(input.orderId, input.status);
    })
  }),
  // ============ SITE SETTINGS ROUTES ============
  settings: router({
    getAll: publicProcedure.query(async () => {
      return getAllSiteSettings();
    }),
    get: publicProcedure.input(z2.object({ key: z2.string() })).query(async ({ input }) => {
      return getSiteSetting(input.key);
    }),
    update: adminProcedure2.input(z2.object({
      key: z2.string(),
      value: z2.string(),
      type: z2.enum(["string", "number", "boolean", "json"]).optional()
    })).mutation(async ({ input }) => {
      return upsertSiteSetting(input.key, input.value, input.type);
    })
  }),
  // ============ BANK ACCOUNT ROUTES ============
  // ============ SLIP VERIFICATION ROUTES (NEW) ============
  autoVerifySlip: adminProcedure2.input(z2.object({ slipId: z2.number(), imageUrl: z2.string() })).mutation(async ({ input }) => {
    const extracted = await verifyPaymentSlip(input.imageUrl);
    const slip = await getPaymentSlip(input.slipId);
    if (!slip) throw new TRPCError3({ code: "NOT_FOUND" });
    return { success: true, extracted, autoVerified: extracted.isValid };
  }),
  // ============ EMAIL NOTIFICATION ROUTES (NEW) ============
  sendOrderConfirmation: adminProcedure2.input(z2.object({ orderId: z2.number() })).mutation(async ({ input }) => {
    const order = await getOrderById(input.orderId);
    if (!order) throw new TRPCError3({ code: "NOT_FOUND" });
    const user = await getUserById(order.userId);
    if (!user || !user.email) throw new TRPCError3({ code: "NOT_FOUND" });
    const items = await getOrderItems(order.id);
    const template = generateOrderConfirmationEmail(order.orderNumber, user.name || "Customer", order.totalAmount.toString(), items.map((item) => ({ name: `Product ${item.productId}`, quantity: item.quantity, price: item.price.toString() })));
    return sendEmail(user.email, template);
  }),
  sendOrderStatusUpdate: adminProcedure2.input(z2.object({ orderId: z2.number(), status: z2.enum(["confirmed", "processing", "shipped", "delivered", "cancelled"]), trackingNumber: z2.string().optional() })).mutation(async ({ input }) => {
    const order = await getOrderById(input.orderId);
    if (!order) throw new TRPCError3({ code: "NOT_FOUND" });
    const user = await getUserById(order.userId);
    if (!user || !user.email) throw new TRPCError3({ code: "NOT_FOUND" });
    const template = generateOrderStatusEmail(order.orderNumber, user.name || "Customer", input.status, input.trackingNumber);
    return sendEmail(user.email, template);
  }),
  // ============ PRODUCT IMAGE UPLOAD ROUTES (NEW) ============
  uploadImage: adminProcedure2.input(z2.object({ productId: z2.number(), imageBase64: z2.string(), fileName: z2.string() })).mutation(async ({ input }) => {
    const { storagePut: storagePut2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const { products: products2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const buffer = Buffer.from(input.imageBase64, "base64");
    const fileKey = `products/${input.productId}-${Date.now()}-${input.fileName}`;
    const { url } = await storagePut2(fileKey, buffer, "image/jpeg");
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not available");
    await dbInstance.update(products2).set({ imageUrl: url, imageKey: fileKey }).where(eq2(products2.id, input.productId));
    return { success: true, url, fileKey };
  }),
  deleteImage: adminProcedure2.input(z2.object({ productId: z2.number() })).mutation(async ({ input }) => {
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not available");
    const { products: products2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await dbInstance.update(products2).set({ imageUrl: null, imageKey: null }).where(eq2(products2.id, input.productId));
    return { success: true };
  }),
  // ============ ORDER ITEMS MANAGEMENT ROUTES (NEW) ============
  addItem: adminProcedure2.input(z2.object({ orderId: z2.number(), productId: z2.number(), quantity: z2.number().min(1), price: z2.string() })).mutation(async ({ input }) => {
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not available");
    const { orderItems: orderItems2 } = (init_schema(), __toCommonJS(schema_exports));
    const result = await dbInstance.insert(orderItems2).values({ orderId: input.orderId, productId: input.productId, quantity: input.quantity, price: parseFloat(input.price) });
    return { success: true, itemId: result[0] };
  }),
  removeItem: adminProcedure2.input(z2.object({ itemId: z2.number() })).mutation(async ({ input }) => {
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not available");
    const { orderItems: orderItems2 } = (init_schema(), __toCommonJS(schema_exports));
    const { eq: eq3 } = __require("drizzle-orm");
    await dbInstance.delete(orderItems2).where(eq3(orderItems2.id, input.itemId));
    return { success: true };
  }),
  updateItem: adminProcedure2.input(z2.object({ itemId: z2.number(), quantity: z2.number().min(1).optional(), price: z2.string().optional() })).mutation(async ({ input }) => {
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not available");
    const { orderItems: orderItems2 } = (init_schema(), __toCommonJS(schema_exports));
    const { eq: eq3 } = __require("drizzle-orm");
    const updateData = {};
    if (input.quantity) updateData.quantity = input.quantity;
    if (input.price) updateData.price = parseFloat(input.price);
    await dbInstance.update(orderItems2).set(updateData).where(eq3(orderItems2.id, input.itemId));
    return { success: true };
  }),
  // ============ CANCEL ORDER ROUTES (NEW) ============
  cancelOrder: adminProcedure2.input(z2.object({ orderId: z2.number(), reason: z2.string() })).mutation(async ({ input }) => {
    const order = await getOrderById(input.orderId);
    if (!order) throw new TRPCError3({ code: "NOT_FOUND" });
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not available");
    await dbInstance.update(orders).set({ status: "cancelled", cancellationReason: input.reason }).where(eq2(orders.id, input.orderId));
    const user = await getUserById(order.userId);
    if (user && user.email) {
      const template = generateOrderStatusEmail(order.orderNumber, user.name || "Customer", "cancelled");
      await sendEmail(user.email, template);
    }
    return { success: true };
  }),
  // ============ TRANSACTION HISTORY MANAGEMENT ROUTES (NEW) ============
  getTransactionHistory: adminProcedure2.input(z2.object({ userId: z2.number().optional(), status: z2.string().optional(), limit: z2.number().default(50), offset: z2.number().default(0) })).query(async ({ input }) => {
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not available");
    const conditions = [];
    if (input.userId) conditions.push(eq2(walletTransactions.walletId, input.userId));
    if (input.status) conditions.push(eq2(walletTransactions.status, input.status));
    let baseQuery = dbInstance.select().from(walletTransactions);
    const query = conditions.length > 0 ? baseQuery.where(and2(...conditions)) : baseQuery;
    const transactions = await query.orderBy(desc2(walletTransactions.createdAt)).limit(input.limit).offset(input.offset);
    return transactions;
  }),
  verifyTransaction: adminProcedure2.input(z2.object({ transactionId: z2.number() })).mutation(async ({ input }) => {
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not available");
    const { wallets: wallets2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const transaction = await dbInstance.select().from(walletTransactions).where(eq2(walletTransactions.id, input.transactionId)).limit(1);
    if (!transaction || !transaction[0]) throw new TRPCError3({ code: "NOT_FOUND" });
    await dbInstance.update(walletTransactions).set({ status: "completed" }).where(eq2(walletTransactions.id, input.transactionId));
    const wallet = await dbInstance.select().from(wallets2).where(eq2(wallets2.id, transaction[0].walletId)).limit(1);
    if (wallet && wallet[0]) {
      const newBalance = (parseFloat(wallet[0].balance) + parseFloat(transaction[0].amount.toString())).toString();
      await dbInstance.update(wallets2).set({ balance: newBalance }).where(eq2(wallets2.id, transaction[0].walletId));
    }
    return { success: true };
  }),
  rejectTransaction: adminProcedure2.input(z2.object({ transactionId: z2.number(), reason: z2.string() })).mutation(async ({ input }) => {
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not available");
    await dbInstance.update(walletTransactions).set({ status: "rejected", notes: input.reason }).where(eq2(walletTransactions.id, input.transactionId));
    return { success: true };
  }),
  bankAccounts: router({
    getActive: publicProcedure.query(async () => {
      return getActiveBankAccounts();
    }),
    getAll: adminProcedure2.query(async () => {
      const dbInstance = await getDb();
      if (!dbInstance) return [];
      return dbInstance.select().from(bankAccounts);
    }),
    create: adminProcedure2.input(z2.object({
      bankName: z2.string(),
      accountNumber: z2.string(),
      accountName: z2.string(),
      qrCode: z2.string().optional()
    })).mutation(async ({ input }) => {
      return createBankAccount(input);
    }),
    update: adminProcedure2.input(z2.object({
      id: z2.number(),
      bankName: z2.string().optional(),
      accountNumber: z2.string().optional(),
      accountName: z2.string().optional(),
      qrCode: z2.string().optional(),
      isActive: z2.boolean().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateBankAccount(id, data);
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid as nanoid2 } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid2()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
