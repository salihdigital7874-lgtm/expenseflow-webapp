# Termux Installation & Server Setup Guide for POCO Android Phone

This document provides exact, step-by-step terminal commands to turn your POCO Android phone into a secure, production-grade Node.js + SQLite database backend server.

---

## Step 1: Install Termux

> [!IMPORTANT]
> **DO NOT install Termux from Google Play Store** (the Play Store build is deprecated and receives no updates).

1. Open browser on your POCO phone and navigate to:
   **https://f-droid.org/en/packages/com.termux/**
2. Download and install the latest **Termux APK**.
3. (Optional) Download and install **Termux:API** APK from F-Droid to enable battery diagnostics.

---

## Step 2: System Package Updates

Open Termux on your POCO phone and execute:

```bash
# Update package repositories & installed tools
pkg update && pkg upgrade -y

# Install Node.js LTS, SQLite3, Git, OpenSSH, and Termux utilities
pkg install nodejs-lts sqlite git openssh curl termux-exec termux-api -y
```

---

## Step 3: Configure Storage & CPU Wake Lock

To prevent Android OS Doze Mode from killing the server process when screen turns off:

```bash
# Grant storage permission to Termux
termux-setup-storage

# Acquire CPU wake lock to ensure CPU stays active
termux-wake-lock
```

> [!TIP]
> **POCO / Xiaomi MIUI / HyperOS Battery Settings**:
> 1. Long-press **Termux App icon** -> App Info.
> 2. Enable **Autostart**.
> 3. Go to **Battery Saver** -> Select **No Restrictions**.
> 4. Open Recent Apps screen -> Tap and hold Termux -> Tap **Lock Icon** so MIUI does not clear it from RAM.

---

## Step 4: Create Backend Project Directory

Inside Termux shell, create your backend folder:

```bash
# Navigate to home folder and create phone-server directory
cd ~
mkdir -p phone-server/backend
cd phone-server/backend
```

Copy or transfer the files from your codebase into `~/phone-server/backend`.

---

## Step 5: Install NPM Dependencies & Initialize `.env`

```bash
# Install node dependencies
npm install

# Create production environment variables
cat << 'EOF' > .env
PORT=5000
JWT_SECRET=poco_salihport_super_secret_jwt_key_2026_x89a
ALLOWED_ORIGIN=*
DB_FILE=./crm.db
EOF
```

---

## Step 6: Initialize Database & Create Admin Account

Run the database initialization script:

```bash
node -e "require('./database').initDatabase()"
```

You will see:
```text
✅ SQLite Database connected at: .../crm.db
✅ SQLite Schema Initialized successfully.
👤 Default admin account created: admin@salihport.local / AdminPassword123!
```

---

## Step 7: Install PM2 Process Manager & Start Server

To ensure your Node.js backend automatically restarts if it crashes:

```bash
# Install PM2 globally
npm install -g pm2

# Start backend server with PM2
pm2 start server.js --name poco-backend

# Enable automatic start on Termux launch
pm2 save
```

---

## Step 8: Verify Backend Server Locally

Test that your backend is running properly on your phone:

```bash
curl -i http://localhost:5000/api/health
```

Expected Response:
```json
{
  "status": "online",
  "server": "POCO Android Server (Termux + Express)",
  "app": "SalihPort ExpenseFlow Backend"
}
```
