import { expect, type Page } from '@playwright/test'

/**
 * Shared across every site-chrome spec (anywhere the homepage's anti-hate modal can be in the way of whatever
 * that file is actually testing). Previously copy-pasted verbatim into six files (navbar-desktop, footer,
 * navbar-mobile, login-signup-modals, language-picker-desktop, user-menu), plus a near-identical seventh
 * version in cookie-consent.spec.ts - centralized here instead.
 */
export const antiHateDialog = (page: Page) =>
	page.locator('[role="dialog"]').filter({ hasText: 'Anti-hate commitment' })

export const dismissAntiHate = async (page: Page) => {
	const dialog = antiHateDialog(page)
	if (await dialog.isVisible().catch(() => false)) {
		// `dispatchEvent`, not `click`: on a narrow/mobile viewport, the cookie-consent banner
		// visually overlaps this button (#2068, reviewed and closed will-not-address - see
		// docs/Testing/site-chrome-test-inventory.md's §3a callout). Even `click({ force: true })`
		// still dispatches at the button's on-screen coordinates (so it can land on the banner
		// instead) - dispatching the event directly to the button element sidesteps that, keeping
		// every other site-chrome test (not actually about this overlap) from being incidentally
		// flaky because of it.
		await dialog.getByRole('button', { name: 'Accept' }).dispatchEvent('click')
		await expect(dialog).not.toBeVisible()
	}
}
