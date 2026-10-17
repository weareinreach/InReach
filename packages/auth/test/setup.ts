/* eslint-disable node/no-process-env */

// @weareinreach/env validates real server env vars at import time - cognitoJwt.ts pulls it in via
// getEnv('COGNITO_CLIENT_ID') and crashes under test with no real .env loaded. Same fix
// packages/api/test/setup.ts and packages/ui/test/setup.ts already apply for the identical reason.
process.env.SKIP_ENV_VALIDATION = 'true'
