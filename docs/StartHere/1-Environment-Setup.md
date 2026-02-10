# ENVIRONMENT SETUP GUIDE

## 1. PREREQUISITES

### Installing Node.js (Version 20)

We use Node.js **Version 20 (LTS)**.

**Check your version:**
node -v

**If your version is higher than 20:**

- Mac/Linux: Use NVM: `nvm install 20` and `nvm use 20`.
- Windows: Uninstall current Node and download v20 from https://nodejs.org/dist/latest-v20.x/

### Installing Docker

1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Open Docker Desktop and wait for the status icon to turn GREEN.
3. Verify by running: `docker info`

### Installing pgAdmin 4 (Desktop App)

1. Download pgAdmin 4: https://www.pgadmin.org/download/
2. Install the application. (We will configure the connection after starting Docker).

### Installing pnpm

    npm install -g pnpm

---

## 2. INSTALLATION & CONFIGURATION

1. **Clone & Install**:
   git clone https://github.com/weareinreach/InReach.git
   cd InReach
   pnpm install

2. **Environment Variables (.env)**:

   - Copy `.env.example` to `.env`.
   - Generate local secrets: `openssl rand -base64 32`
   - **Manual Update**: Paste the API keys provided by the Tech Lead into the `.env` file.
   - **Sync**: `cp .env apps/app/.env && cp .env packages/db/.env && cp .env packages/ui/.env`

3. **Locales Config**:
   Open `packages/db/generated/locales.mjs` and ensure `localeList` includes `'en'`.

---

## 3. DATABASE SETUP

### Step A: Clear Port 5432 & Start Containers

Before starting Docker, we must ensure no other Postgres instance is "ghosting" on port 5432.

**For MacOS:**

1. Run: `sudo lsof -i :5432`
2. If a process appears, note the PID (e.g., 1234) and run: `sudo kill -9 <PID>`

**For Windows:**

1. Run: `netstat -ano | findstr :5432`
2. If a process appears, note the PID at the end of the line (e.g., 5678) and run: `taskkill /PID <PID> /F`
3. **Pro-Tip**: If it keeps restarting, open **Services.msc**, find "PostgreSQL," and click **Stop**.

**Launch Containers:**

1. Once the port is clear, run from the **project root**:
   pnpm docker:up

### Step B: Quick Health Check (Web Tools)

Verify the containers are healthy by visiting these URLs in your browser:

- **Adminer**: http://localhost:8080
  - System: `PostgreSQL` | Server: `db` | User: `user` | Pass: `password` | DB: `inreach`
- **pgAdmin (Web)**: http://localhost:5050
  - Login: `hello@inreach.org` | Password: `pgadmin`
- **Redis Insight**: http://localhost:8001 (Visualizer for cache)

### Step C: Configure pgAdmin Desktop

1. Launch the pgAdmin 4 desktop app and click **Add New Server**.
2. **General Tab**: Name it `InReach Local`.
3. **Connection Tab**:
   - Host: `localhost`
   - Port: `5432`
   - Maintenance DB: `postgres`
   - Username: `user`
   - Password: `password`
4. Click **Save**.

### Step D: Data Preparation (Download & Unzip)

1. Download the database backup file provided by the Tech Lead.
2. Unzip it so you have `inreach_golden_backup.sql` in your project root.

### Step E: Import Backup Data

1. Open a terminal in your project root.
2. **Copy and paste the ENTIRE line below:**
   (echo "SET session_replication_role = 'replica';"; cat inreach_golden_backup.sql; echo "SET session_replication_role = 'origin';") | docker exec -i -e PGPASSWORD='password' InReach-PostgreSQL psql -U user -d inreach

### Step F: Verify & Initialize

1. **DB Verification (pgAdmin 4)**:

   - **Open pgAdmin**: Double-click your **InReach Local** server in the sidebar to connect.
   - **Select the Database**: Expand **Databases**, then click once on the **inreach** database (not `postgres`).
   - **Open Query Tool**: Go to the top menu and select **Tools** > **Query Tool**.
   - **Run the Check**: Copy/paste the following and press **F5**:
     ```sql
     SELECT count(*) FROM "Organization";
     ```
   - (If the result is greater than 0, your data is successfully imported!)

2. **Prisma Verification**: Run from the project root:
   ```bash
   cd packages/db
   pnpm with-env prisma generate
   pnpm with-env prisma migrate status
   ```
   - (If status says "Database schema is up to date", you are ready!)

---

## 4. RUNNING THE APP

1. `cd apps/app`
2. `pnpm run dev`
3. Open http://localhost:3000
