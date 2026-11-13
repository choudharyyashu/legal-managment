# BACKEND SETUP & DATABASE STATUS REPORT
## Heugly & Bludworth Legal Practice Management Software

**Document:** Environment, Dependencies, Database Status & Local Setup Guide  
**Date:** November 13, 2026  
**Auditor:** Automated Engineering System  

---

## 1. COMPONENT STATUS SUMMARY

| Component | Status | Verified Evidence |
| :--- | :---: | :--- |
| **Node.js Runtime** | **Active (v24.18.0)** | System path check |
| **npm Package Manager** | **Active (v11.16.0)** | System path check |
| **Backend Dependencies** | **Installed (107 packages)** | `backend/node_modules/` & `backend/package-lock.json` present |
| **Prisma CLI** | **Installed (v5.22.0)** | `npx prisma --version` |
| **Prisma Client** | **Generated (v5.22.0)** | Generated to `backend/node_modules/@prisma/client` |
| **TypeScript Compiler** | **Clean (0 errors)** | `npx tsc --noEmit` exited with code 0 |
| **Backend Build** | **Success** | `npm run build` generated `backend/dist/` |
| **Environment File** | **Directory Conflict** | `backend/.env` is currently an empty directory |
| **Local MySQL Binary** | **Detected** | `C:\xampp\mysql\bin\mysql.exe` exists |
| **Local MySQL Service** | **Inactive (Port 3306 Closed)** | TCP probe on port 3306 failed; `ECONNREFUSED` |
| **Database `legal-db`** | **Not Created** | MySQL service not running |
| **Prisma Migrations** | **Postponed** | Awaiting MySQL activation to run initial migration |

---

## 2. THE `backend/.env` CONFLICT EXPLAINED

During workspace inspection, `backend/.env` was detected as an **empty Directory** rather than a configuration file:
- **Created:** `13-11-2026 12:11:10`
- **File System Type:** Directory
- **Impact:**
  - Tools such as Prisma CLI and Node's `fs.readFileSync` attempt to open `.env` as a file. Because it is a directory, the operating system throws `EISDIR: illegal operation on a directory, read`.
  - Environment variables like `DATABASE_URL` are not automatically loaded from disk.
- **Required Resolution:**
  - Request user confirmation to remove the empty directory `backend/.env`.
  - Create a standard file `backend/.env` populated from `backend/.env.example`.

---

## 3. HOW TO START MYSQL & PREPARE FOR MIGRATION

The host system has XAMPP installed at `C:\xampp`. To bring the database online:

### Step 1: Start MySQL via XAMPP Control Panel
1. Launch `C:\xampp\xampp-control.exe`.
2. Locate **MySQL** in the module list and click **Start**.
3. Confirm the port indicates `3306` and the status turns green.

*Alternative via command line:*
```powershell
Start-Process "C:\xampp\mysql\bin\mysqld.exe" -ArgumentList "--console"
```

### Step 2: Create the Target Database
Open a terminal and run:
```powershell
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS \`legal-db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"
```

### Step 3: Run Database Diagnostic
Inside `backend/`, run:
```powershell
npm run db:test
```
You should see:
```
1. Testing direct MySQL connection via mysql2...
   SUCCESS: Connected to MySQL server!
2. Testing Prisma connection...
   SUCCESS: Connected via Prisma ORM!
```

### Step 4: Run Initial Prisma Migration
Once the database is online and confirmed empty, run:
```powershell
cd backend
npx prisma migrate dev --name init
```
This will:
- Generate the initial SQL migration script in `backend/prisma/migrations/`.
- Create all 17 tables in `legal-db`.
- Regenerate the Prisma Client.

