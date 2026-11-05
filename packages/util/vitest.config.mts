import { defineConfig } from 'vitest/config'

// Deliberately minimal - packages/util has no broader test infrastructure yet. This exists specifically
// to unit-test url/index.ts's pure string-manipulation helpers, several of which are security- or
// correctness-sensitive (isSafeRelativePath guards an open-redirect check; urlMatchesPrefix guards a
// duplicate-check exception's boundary behavior) and had zero coverage before this.
export default defineConfig({
	resolve: { tsconfigPaths: true },
	test: {
		environment: 'node',
		globals: false,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'json-summary'],
			all: false,
		},
	},
})
