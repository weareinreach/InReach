import { expect, type Page, test } from '@playwright/test'

/**
 * Section 3d of docs/Testing/site-chrome-test-inventory.md - the avatar/account menu (`UserMenu`,
 * packages/ui/components/core/UserMenu.tsx), against the real running app.
 *
 * Only the logged-out state (3d.1) is covered here. Every other case in this section (3d.2-3d.8: avatar menu
 * contents, admin options, edit-page entry, sign-out) needs a real authenticated session - there's no
 * Playwright auth fixture in this repo yet (same reason `tests/crud` is still empty; see
 * docs/Testing/README.md). 3d.9 (session still loading) was investigated via delaying `/api/auth/session`,
 * but didn't reliably produce an observable "disabled menu" window in this app's architecture (likely
 * resolved server-side before the client ever shows a loading state) - not pursued further given it's a
 * narrow edge case in a section that's mostly blocked on the same missing fixture anyway.
 */
const dismissAntiHate = async (page: Page) => {
	const dialog = page.locator('[role="dialog"]').filter({ hasText: 'Anti-hate commitment' })
	if (await dialog.isVisible().catch(() => false)) {
		await dialog.getByRole('button', { name: 'Accept' }).dispatchEvent('click')
		await expect(dialog).not.toBeVisible()
	}
}

test.beforeEach(async ({ context }) => {
	await context.clearCookies()
})

test('3d.1: logged out, UserMenu shows Log in / Sign up free instead of an avatar menu', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 })
	await page.goto('/')
	await dismissAntiHate(page)

	await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible()
	await expect(page.getByRole('button', { name: 'Sign up for free' })).toBeVisible()
})
