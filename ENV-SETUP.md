# Environment Variables Setup

## สร้างไฟล์ `.env`

สร้างไฟล์ `.env` ในโฟลเดอร์ root ของโปรเจค และเพิ่มค่าต่อไปนี้:

```env
# ===== DATABASE CONFIGURATION =====
# MySQL Connection String
# Format: mysql://username:password@host:port/database
DATABASE_URL=mysql://root:password@localhost:3306/nyxos_lamp_shop

# ===== AUTHENTICATION =====
# JWT Secret for session management
# Generate with: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-here-change-this

# ===== APP CONFIGURATION =====
VITE_APP_TITLE=Nyxos - Premium Lamp Shop
VITE_APP_LOGO=
```

## ตัวอย่างการสร้าง JWT Secret

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## ตัวอย่าง DATABASE_URL

### Local MySQL
```
mysql://root:password@localhost:3306/nyxos_lamp_shop
```

### Remote MySQL
```
mysql://username:password@your-server.com:3306/nyxos_lamp_shop
```

### Docker MySQL
```
mysql://root:root@mysql:3306/nyxos_lamp_shop
```

## หลังจากสร้าง .env

1. ตรวจสอบว่า MySQL server กำลังทำงาน
2. รัน: `pnpm db:push`
3. รัน: `node seed-db.mjs`
4. เริ่มเซิร์ฟเวอร์: `pnpm dev`
