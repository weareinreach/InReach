import { test as setup } from '@playwright/test'

/**
 * Logs in once as the dedicated Playwright test account (a real, confirmed Cognito user that exists solely
 * for this purpose - see docs/Testing/README.md for how it was provisioned) via NextAuth's credentials API
 * directly, rather than driving the login modal's UI. This app's session validation re-verifies the resulting
 * access token against live Cognito on every request (see packages/auth/next-auth/auth-options.ts's `jwt`
 * callback) - there is no local-only fake session that would survive a page load, so a real login is required
 * here, not a shortcut around it.
 *
 * Every spec under `tests/crud/` reuses the resulting storageState (see playwright.config.ts's `crud`
 * project) instead of logging in per-test.
 */
const AUTH_FILE = 'tests/crud/.auth/test-user.json'

setup('authenticate', async ({ page, baseURL }) => {
	const email = process.env.PLAYWRIGHT_TEST_USER_EMAIL
	const password = process.env.PLAYWRIGHT_TEST_USER_PASSWORD
	if (!email || !password) {
		throw new Error(
			'PLAYWRIGHT_TEST_USER_EMAIL / PLAYWRIGHT_TEST_USER_PASSWORD are not set - see .env.example and ' +
				'docs/Testing/README.md for how this account was provisioned.'
		)
	}

	const csrfResponse = await page.request.get('/api/auth/csrf')
	const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string }

	// The credentials provider is registered with `id: 'cognito'` (packages/auth/providers/cognito.ts),
	// not the default `credentials` - the callback path has to match that id, not the provider type.
	await page.request.post('/api/auth/callback/cognito', {
		form: {
			email,
			password,
			csrfToken,
			callbackUrl: baseURL ?? 'http://localhost:3000',
			json: 'true',
		},
	})

	const sessionResponse = await page.request.get('/api/auth/session')
	const session = (await sessionResponse.json()) as { user?: { id?: string } }
	if (!session?.user?.id) {
		throw new Error(
			`Login did not produce a session (got ${JSON.stringify(session)}) - the test account may need ` +
				're-confirming, or its password may have changed.'
		)
	}

	await page.context().storageState({ path: AUTH_FILE })
})
