# Architecture Overview

## Tech Stack

- **Framework**: Next.js (React)
- **Language**: TypeScript
- **Styling**: Mantine (Component Library & Hooks)
- **API Layer**: tRPC (End-to-end typesafe APIs)
- **Database**: PostgreSQL (via Docker locally)
- **ORM**: Prisma
- **Authentication**: NextAuth.js / AWS Cognito

## Monorepo Structure

The project is structured as a monorepo:

- **`apps/app`**: The main Next.js application.
- **`packages/ui`**: Shared UI components (Mantine), Storybook, and icons.
- **`packages/db`**: Database schema (Prisma), migrations, and seed scripts.
- **`packages/api`**: tRPC routers and backend logic.

## Key Concepts

### Data Flow (tRPC)

The frontend (`apps/app` or `packages/ui`) calls backend functions directly using tRPC hooks.

- **Query**: Fetches data (e.g., `api.location.forVisitCard.useQuery`).
- **Mutation**: Modifies data (e.g., `api.location.create.useMutation`).
- **Validation**: Inputs are validated using **Zod** schemas before reaching the server.

### Forms

We use `react-hook-form` combined with `zodResolver`.

- **Pattern**: Define a Zod schema -> Infer TypeScript type -> Pass to `useForm`.
- **Components**: Custom wrappers like `AddressAutocomplete` handle complex logic while syncing with the form state.

### Storybook

We use Storybook to develop UI components in isolation.
To run it:

```bash
cd packages/ui
pnpm dev
```
