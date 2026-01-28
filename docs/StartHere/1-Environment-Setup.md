# Environment Setup

## Prerequisites

- **Node.js**: Version v20 or higher.
- **Package Manager**: [pnpm](https://pnpm.io/).
  ```bash
  npm -g install pnpm
  ```
- **Docker**: Docker Desktop installed and running (required for the local database).

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/weareinreach/InReach.git
   cd InReach
   ```
2. **Install dependencies**:
   ```bash
   pnpm install
   ```

## Configuration (.env)

The project requires environment variables at the root and within specific packages.

1. **Root Setup**:

   - Copy `.env.example` to `.env` in the root directory.
   - Generate secrets for `NEXTAUTH_SECRET` and `SESSION_SECRET`:
     ```bash
     openssl rand -base64 32
     ```
   - Fill in the remaining variables (Google Places API, AWS Cognito, etc.) as provided in the internal "InReach Dev Setup Notes" or by the team lead.

2. **Package Setup**:

   - Copy your populated `.env` file to the following directories:
     - `apps/app/.env`
     - `packages/db/.env`
     - `packages/ui/.env`

3. **Locales Configuration**:
   - Open `packages/db/locales.mjs`.
   - Ensure the `localeList` array includes `'en'`.
   - Save the file.

## Database Setup

1. **Start Docker Containers**:
   ```bash
   pnpm docker:up
   ```
2. **Initialize Database**:

   ```bash
   pnpm --filter @weareinreach/db db:migrate
   ```

   _Note: This runs migrations and seeds the database with initial schema structures._

3. **Data Migrations** (Optional):
   If you need to apply additional data transformations (e.g. geo data), run:
   ```bash
   pnpm --filter @weareinreach/db db:dataMigrate
   ```

## Running the App

1. Navigate to the app directory:
   ```bash
   cd apps/app
   ```
2. Start the development server:
   ```bash
   pnpm dev
   ```
3. Open http://localhost:3000.
