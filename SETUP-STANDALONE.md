# Nyxos Lamp Shop - Standalone Setup Guide

## 📋 ภาพรวม (Overview)

นี่คือ **Standalone Version** ของ Nyxos Lamp Shop ที่ไม่ต้องเชื่อมต่อ Manus Platform หรือ external services ใดๆ สามารถติดตั้งและใช้งานได้เลยบนเครื่องของคุณเอง

## 🛠️ ความต้องการของระบบ (Requirements)

- **Node.js** v18 หรือสูงกว่า
- **pnpm** (แนะนำ) หรือ npm
- **MySQL** v8 หรือ **MariaDB** v10.5+
- **Git** (ถ้าต้องการ clone)

## 📦 ขั้นตอนการติดตั้ง (Installation Steps)

### 1️⃣ แตกไฟล์ ZIP และเข้าไปในโฟลเดอร์

```bash
unzip nyxos-lamp-shop.zip
cd nyxos-lamp-shop-export
```

### 2️⃣ ติดตั้ง Dependencies

```bash
pnpm install
# หรือใช้ npm
npm install
```

### 3️⃣ สร้างไฟล์ `.env`

คัดลอกจากไฟล์ `.env.example` และแก้ไขค่า DATABASE_URL:

```bash
cp .env.example .env
```

แล้วแก้ไขไฟล์ `.env`:

```env
# Database Connection (ตัวอย่าง)
DATABASE_URL=mysql://root:password@localhost:3306/nyxos_lamp_shop

# JWT Secret (สร้างเองได้ เช่น ใช้ openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-here

# App Configuration
VITE_APP_TITLE=Nyxos - Premium Lamp Shop
```

### 4️⃣ สร้าง Database

```bash
# สร้าง database ใน MySQL
mysql -u root -p -e "CREATE DATABASE nyxos_lamp_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 5️⃣ Push Database Schema

```bash
pnpm db:push
```

### 6️⃣ Seed Database ด้วยข้อมูลตัวอย่าง

```bash
node seed-db.mjs
```

**Output ที่คาดหวัง:**
```
🌱 Starting database seed...
🗑️  Clearing existing data...
👤 Creating admin user...
👤 Creating sample customer...
🏦 Creating bank account...
📦 Creating sample products...
💰 Creating wallets...
⚙️  Creating site settings...
✅ Database seeded successfully!

📝 Default Credentials:
   Admin: admin / admin123
   Customer: customer / customer123
```

### 7️⃣ รันเซิร์ฟเวอร์

```bash
pnpm dev
```

เซิร์ฟเวอร์จะเริ่มที่ `http://localhost:3000`

## 🔐 บัญชีผู้ใช้ (Default Accounts)

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Admin (สามารถจัดการสินค้า, คำสั่งซื้อ, สลิป)

### Customer Account
- **Username:** `customer`
- **Password:** `customer123`
- **Role:** User (สามารถซื้อสินค้า, เติมเงิน)

## 🏦 ข้อมูลธนาคาร (Bank Account)

```
ธนาคาร: KASIKORNBANK
เลขบัญชี: 141-1-49966-5
ชื่อบัญชี: ด.ช. ดรัณภพ นนท์นภัส
```

## 📱 การใช้งาน (Usage)

### สำหรับลูกค้า (Customer)

1. **ลงทะเบียน/เข้าสู่ระบบ**
   - ไปที่หน้าแรก
   - คลิก "Sign In"
   - ใช้ username: `customer` password: `customer123`

2. **ดูสินค้า**
   - ไปที่ "Shop"
   - ดูรายละเอียดสินค้า

3. **เติมเงิน Wallet**
   - ไปที่ "Wallet"
   - ใส่จำนวนเงินที่ต้องการเติม
   - คลิก "Show QR Code" เพื่อดู QR Code
   - อัพโหลดสลิปการโอนเงิน
   - รอให้ Admin ตรวจสอบ

4. **สั่งซื้อสินค้า**
   - ไปที่ "Shop"
   - เลือกสินค้า
   - กำหนดจำนวน
   - คลิก "Proceed to Checkout"
   - เลือกวิธีจัดส่ง
   - ชำระเงินด้วย Wallet

### สำหรับ Admin

1. **เข้าสู่ระบบ Admin**
   - ไปที่ "Admin" (หรือ `/admin`)
   - ใช้ username: `admin` password: `admin123`

2. **จัดการสินค้า (Products Tab)**
   - เพิ่มสินค้าใหม่
   - อัพโหลดรูปภาพสินค้า
   - แก้ไข/ลบสินค้า

3. **จัดการคำสั่งซื้อ (Orders Tab)**
   - ดูรายการคำสั่งซื้อ
   - เปลี่ยนสถานะ (Pending → Confirmed → Processing → Shipped → Delivered)
   - ยกเลิกคำสั่งซื้อพร้อมเหตุผล

4. **ตรวจสอบสลิป (Payment Slips Tab)**
   - ดูสลิปการโอนเงินที่รอตรวจสอบ
   - คลิก "Approve" เพื่อยืนยัน
   - คลิก "Reject" เพื่อปฏิเสธ

5. **ตั้งค่าเว็บไซต์ (Settings Tab)**
   - เปลี่ยนชื่อเว็บไซต์
   - เปลี่ยนคำอธิบาย
   - เปลี่ยนสีเน้น (Accent Color)

## 📁 โครงสร้างไฟล์ (File Structure)

```
nyxos-lamp-shop-export/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── pages/         # หน้าเว็บต่างๆ
│   │   ├── components/    # UI Components
│   │   └── lib/          # Utilities
│   └── public/           # Static files
├── server/               # Backend Express + tRPC
│   ├── routers.ts       # API endpoints
│   ├── db.ts            # Database queries
│   ├── localAuth.ts     # Local authentication
│   └── storage.ts       # File storage
├── drizzle/             # Database schema
│   └── schema.ts        # Table definitions
├── seed-db.mjs          # Database seed script
├── .env.example         # Environment variables template
├── package.json         # Dependencies
└── README-SETUP.md      # Documentation
```

## 🚀 Production Deployment

### Build for Production

```bash
pnpm build
```

### Run Production Server

```bash
NODE_ENV=production pnpm start
```

## 🐛 Troubleshooting

### ❌ Error: "Cannot find module 'mysql2'"
```bash
pnpm install
```

### ❌ Error: "Database connection failed"
- ตรวจสอบ DATABASE_URL ในไฟล์ `.env`
- ตรวจสอบว่า MySQL server กำลังทำงาน
- ตรวจสอบ username/password

### ❌ Error: "Port 3000 already in use"
```bash
# ใช้ port อื่น
PORT=3001 pnpm dev
```

### ❌ Login ไม่ได้
- ตรวจสอบว่า seed script ทำงานสำเร็จ
- ลองรัน seed script อีกครั้ง: `node seed-db.mjs`

## 📝 Scripts ที่มี

```bash
# Development
pnpm dev          # รันเซิร์ฟเวอร์ development

# Database
pnpm db:push      # Push schema changes
pnpm db:studio    # Open Drizzle Studio

# Build & Production
pnpm build        # Build for production
pnpm start        # Run production server

# Testing
pnpm test         # Run tests
```

## 💡 Tips

1. **เปลี่ยน Admin Password**
   - ลงทะเบียนบัญชีใหม่
   - ใช้ SQL ให้บัญชีนั้นเป็น admin:
     ```sql
     UPDATE users SET role = 'admin' WHERE username = 'newadmin';
     ```

2. **ลบข้อมูลทั้งหมดและเริ่มใหม่**
   ```bash
   node seed-db.mjs
   ```

3. **ดูฐานข้อมูลด้วย Drizzle Studio**
   ```bash
   pnpm db:studio
   ```

## 📞 Support

หากมีปัญหา ให้ตรวจสอบ:
- `.manus-logs/devserver.log` - Server logs
- `.manus-logs/browserConsole.log` - Browser console errors
- Database connection settings

## 📄 License

MIT License

---

**Happy Shopping! 🛍️**
