import { defineConfig } from 'vitest/config'

// Deliberately minimal - packages/auth has no broader test infrastructure yet. This exists specifically
// to unit-test the Cognito token schemas in cognitoJwt.ts, so a future dependency bump (or hand-edit)
// can't silently reintroduce the zod 3->4 `.uuid()` regression that broke login for any account whose
// `sub` wasn't RFC 4122-compliant - see lib/cognitoJwt.test.ts.
export default defineConfig({
	resolve: { tsconfigPaths: true },
	test: {
		environment: 'node',
		setupFiles: ['./test/setup.ts'],
		globals: false,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'json-summary'],
			all: false,
		},
	},
})
