import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [react()],
	test: {
		environment: 'jsdom',
		setupFiles: ['./test/setup.ts'],
		globals: false,
		css: false,
	},
})
