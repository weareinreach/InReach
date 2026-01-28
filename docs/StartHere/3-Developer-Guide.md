# Developer Guide

## Git Workflow

- **Main Branch**: `main` (Production code).
- **Development Branch**: `dev` (Base for all local development).
- **Feature Branches**: Create new branches from `dev`.
  ```bash
  git checkout dev
  git pull
  git checkout -b feature/my-new-feature
  ```
- **Pull Requests**: Merge feature branches into `dev`.

## Localization (Crowdin)

Translations are managed via Crowdin and synced automatically.

1. **Update English**: Make changes to the English source files locally.
2. **Push**: Merge changes to `dev`.
3. **Sync**: A GitHub Action uploads strings to Crowdin.
4. **Translate**: Translators update strings in Crowdin.
5. **Download**: GitHub Action opens a PR with updated translations.

## Database Migrations

When changing the Prisma schema (`packages/db/prisma/schema.prisma`):

1. **Generate Migration**:
   ```bash
   pnpm db:migrate
   ```
2. **Data Migrations**:
   - Scripts located in `packages/db/prisma/data-migrations`.
   - Use `pnpm db:dataMigrate` to apply data transformations.

## Common Issues & Troubleshooting

- **Ports**: Ensure port `3000` (App) and `5432` (Postgres) are free.
- **Env Vars**: If the app crashes on start, verify `.env` is copied to `apps/app`, `packages/db`, and `packages/ui`.
- **Database Connection**: If you see connection errors, ensure Docker is running (`pnpm docker:up`).
- **Database Reset**: If your local database gets into a bad state, you can reset it (wipes all data):
  ```bash
  pnpm --filter @weareinreach/db db:reset
  ```
- **Secrets**: Never commit `.env` files to Git.
