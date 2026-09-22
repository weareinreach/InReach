/* eslint-disable node/no-process-env */

import { type PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'

/** Read environment variables from file. https://github.com/motdotla/dotenv */
// require('dotenv').config();

/** See https://playwright.dev/docs/test-configuration. */
const config: PlaywrightTestConfig = {
	testDir: './tests',
	/* Maximum time one test can run for. */
	timeout: 30 * 1000,
	expect: {
		/**
		 * Maximum time expect() should wait for the condition to be met. For example in `await
		 * expect(locator).toHaveText();`
		 */
		timeout: 5000,
		/**
		 * Screenshot-diff tolerance for `toHaveScreenshot()`. Font antialiasing/subpixel rendering differs
		 * slightly even between runs on the same machine - a tolerance of 0 would flag that noise as a failure on
		 * every run. This does NOT solve cross-machine/cross-OS font rendering differences on its own - baselines
		 * are still only reliably comparable when generated and checked in the same environment (see the Testing
		 * README).
		 */
		toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
	},
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: 'html',
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
		actionTimeout: 0,
		baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',
	},

	/* Chromium only for now - add firefox/webkit later if a real cross-browser bug shows up.
	 * `mobile`/`tablet` are scoped via `testMatch` to only the real-device-class flow specs (see
	 * docs/Testing/search-test-inventory.md §12, cases 12.5/12.6) - applying them to the whole
	 * suite by default would silently multiply every existing spec's run count and viewport
	 * assumptions that were never written with mobile/tablet in mind. */
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
			},
			testIgnore: /device-flow\.spec\.ts/,
		},
		{
			name: 'mobile',
			use: {
				// Viewport/touch/UA emulation from the device preset, but forced onto Chromium
				// (already installed) rather than the preset's own default of WebKit - matches
				// this config's existing "Chromium only for now" stance above, without needing a
				// second browser engine installed just for these two device-class specs.
				...devices['iPhone 13'],
				defaultBrowserType: 'chromium',
			},
			testMatch: /device-flow\.spec\.ts/,
		},
		{
			name: 'tablet',
			use: {
				...devices['iPad (gen 7)'],
				defaultBrowserType: 'chromium',
			},
			testMatch: /device-flow\.spec\.ts/,
		},
	],

	/* Folder for test artifacts such as screenshots, videos, traces, etc. */
	outputDir: 'test-results/',

	/* Reuse an already-running dev server (common locally) instead of failing on a port conflict;
	 * always start a fresh one in CI, where nothing is running yet. */
	webServer: process.env.PLAYWRIGHT_BASE_URL
		? undefined
		: {
				command: 'pnpm dev',
				port: 3000,
				reuseExistingServer: !process.env.CI,
				timeout: 120 * 1000,
			},
}

export default config
