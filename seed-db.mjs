import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import crypto from "crypto";
import * as schema from "./drizzle/schema.js";

const DATABASE_URL = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/nyxos_lamp_shop";

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Parse DATABASE_URL
    const url = new URL(DATABASE_URL);
    const connection = await mysql.createConnection({
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      port: url.port || 3306,
    });

    const db = drizzle(connection);

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    await connection.execute("TRUNCATE TABLE order_items");
    await connection.execute("TRUNCATE TABLE orders");
    await connection.execute("TRUNCATE TABLE payment_slips");
    await connection.execute("TRUNCATE TABLE wallet_transactions");
    await connection.execute("TRUNCATE TABLE wallets");
    await connection.execute("TRUNCATE TABLE products");
    await connection.execute("TRUNCATE TABLE users");
    await connection.execute("TRUNCATE TABLE site_settings");
    await connection.execute("TRUNCATE TABLE bank_accounts");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");

    // Create admin user
    console.log("👤 Creating admin user...");
    await connection.execute(
      "INSERT INTO users (username, passwordHash, name, email, role, loginMethod, createdAt, updatedAt, lastSignedIn) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())",
      ["admin", hashPassword("admin123"), "Admin User", "admin@nyxos.local", "admin", "local"]
    );

    // Create sample customer
    console.log("👤 Creating sample customer...");
    await connection.execute(
      "INSERT INTO users (username, passwordHash, name, email, role, loginMethod, createdAt, updatedAt, lastSignedIn) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())",
      ["customer", hashPassword("customer123"), "Sample Customer", "customer@nyxos.local", "user", "local"]
    );

    // Create bank account
    console.log("🏦 Creating bank account...");
    await connection.execute(
      "INSERT INTO bank_accounts (bankName, accountNumber, accountName, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())",
      ["KASIKORNBANK", "141-1-49966-5", "ด.ช. ดรัณภพ นนท์นภัส", true]
    );

    // Create sample products
    console.log("📦 Creating sample products...");
    const products = [
      {
        name: "Modern Table Lamp",
        description: "Elegant modern table lamp with warm LED light",
        price: 1299.00,
        stock: 15,
        category: "Modern",
      },
      {
        name: "Classic Floor Lamp",
        description: "Traditional floor lamp with adjustable brightness",
        price: 1899.00,
        stock: 8,
        category: "Classic",
      },
      {
        name: "Pendant Light",
        description: "Contemporary pendant light for dining areas",
        price: 899.00,
        stock: 20,
        category: "Modern",
      },
      {
        name: "Desk Lamp Pro",
        description: "Professional desk lamp with USB charging port",
        price: 699.00,
        stock: 25,
        category: "Modern",
      },
      {
        name: "Vintage Wall Sconce",
        description: "Vintage-style wall sconce with brass finish",
        price: 599.00,
        stock: 12,
        category: "Classic",
      },
    ];

    for (const product of products) {
      await connection.execute(
        "INSERT INTO products (name, description, price, stock, category, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
        [product.name, product.description, product.price, product.stock, product.category, true]
      );
    }

    // Create wallets for users
    console.log("💰 Creating wallets...");
    await connection.execute(
      "INSERT INTO wallets (userId, balance, createdAt, updatedAt) VALUES (1, 0, NOW(), NOW())"
    );
    await connection.execute(
      "INSERT INTO wallets (userId, balance, createdAt, updatedAt) VALUES (2, 5000, NOW(), NOW())"
    );

    // Create site settings
    console.log("⚙️  Creating site settings...");
    await connection.execute(
      "INSERT INTO site_settings (key, value, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())",
      ["siteName", "Nyxos - Premium Lamp Shop"]
    );
    await connection.execute(
      "INSERT INTO site_settings (key, value, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())",
      ["siteDescription", "Discover elegant and sophisticated lighting solutions from Nyxos"]
    );
    await connection.execute(
      "INSERT INTO site_settings (key, value, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())",
      ["accentColor", "#c41e3a"]
    );

    await connection.end();

    console.log("✅ Database seeded successfully!");
    console.log("\n📝 Default Credentials:");
    console.log("   Admin: admin / admin123");
    console.log("   Customer: customer / customer123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
