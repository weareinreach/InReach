/* eslint-disable node/no-process-env */
import { defineConfig } from 'prisma/config'

// The `prisma` CLI (generate/migrate/studio) is always invoked through the `with-env` script,
// which loads ../../.env before this file is read - so process.env is already populated here.
// Uses DB_DIRECT_URL (not the possibly-pooled DATABASE_URL) since Migrate/introspection need a
// direct connection; the runtime client's pooled connection is configured separately via
// @prisma/adapter-pg in client/index.ts.
export default defineConfig({
	schema: 'prisma/schema.prisma',
	datasource: {
		url: process.env.DB_DIRECT_URL,
	},
	migrations: {
		seed: 'turbo run db:run-seed',
	},
})
