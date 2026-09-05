/* eslint-disable node/no-process-env */

// @weareinreach/env validates real server env vars (e.g. DATABASE_URL, GOOGLE_PLACES_API_KEY) at import
// time - anything that transitively pulls in @weareinreach/db (permissions.ts -> context.ts -> db)
// crashes under test with no real .env loaded. Same fix packages/ui/test/setup.ts already applies for
// the identical reason.
process.env.SKIP_ENV_VALIDATION = 'true'
