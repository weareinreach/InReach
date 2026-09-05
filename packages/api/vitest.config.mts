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
	},
})
