import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
		// `next-i18next/pages`'s export relies on a Next.js-specific export condition Vite doesn't set,
		// so it's unresolvable as a bare import under Vitest even with `vi.mock` (that only intercepts
		// the module registry, not Vite's own import-analysis/resolution step, which fails first).
		// `next-i18next/pages`'s `useTranslation` is a thin wrapper around `react-i18next`'s own hook of
		// the same signature - aliasing directly to it works against the real `I18nextProvider`
		// `test-utils.tsx` already sets up, for every component test that needs this import, not just one.
		alias: { 'next-i18next/pages': 'react-i18next' },
	},
	plugins: [react()],
	test: {
		environment: 'jsdom',
		setupFiles: ['./test/setup.ts'],
		globals: false,
		css: false,
	},
})
