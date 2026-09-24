import { defineConfig } from 'vitest/config'

// Deliberately minimal - packages/api has no broader test infrastructure yet (no DB test container,
// no fixtures). This exists specifically to unit-test the permission-gating logic every new Content
// Search & Bulk Edit procedure depends on, without needing a live database - see
// lib/middleware/permissions.test.ts.
export default defineConfig({
	resolve: { tsconfigPaths: true },
	test: {
		environment: 'node',
		setupFiles: ['./test/setup.ts'],
		globals: false,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'json-summary'],
			// `all: true` includes every source file in the report, not just ones a running test happens to
			// import - otherwise untested files are silently absent from the denominator instead of showing
			// as 0%. `reportOnFailure: true` because several suites have intentionally-failing tests that
			// confirm real bugs (see docs/Testing/) - without this, one red test suppresses the whole
			// coverage report for that run.
			all: true,
			reportOnFailure: true,
		},
	},
})
