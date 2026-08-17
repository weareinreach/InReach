/* eslint-disable node/no-process-env */
/* eslint-disable turbo/no-undeclared-env-vars */
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

	/* Chromium only for now - add firefox/webkit later if a real cross-browser bug shows up. */
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
			},
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
