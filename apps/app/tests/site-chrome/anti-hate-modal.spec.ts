import { expect, type Page, test } from '@playwright/test'

/**
 * Section 1 of docs/Testing/site-chrome-test-inventory.md - the homepage-only first-visit "anti-hate
 * commitment" popup (`AntiHatePopup`, packages/ui/components/core/AntiHateMessage.tsx), gated by the
 * `inr-ahpop` cookie. Against the real running app.
 */

test.beforeEach(async ({ context }) => {
	await context.clearCookies()
})

/**
 * Scoped past any other `role="dialog"` element that can exist on the page at the same time (e.g. a Popover
 * elsewhere, or - on the homepage specifically - a second, always-in-DOM Modal with the same role, confirmed
 * via a DOM dump while debugging this file). Matching on this modal's own content, not just the role, is what
 * makes the locator unique.
 */
const antiHateDialog = (page: Page) =>
	page.locator('[role="dialog"]').filter({ hasText: 'Anti-hate commitment' })

/**
 * The cookie-consent banner (site-chrome §2) can render at the same time as this modal and, on a narrow
 * viewport, intercept clicks meant for it - dismiss both, same as a real first-time visitor would have to.
 */
const dismissAntiHateAndConsent = async (page: Page) => {
	await antiHateDialog(page).getByRole('button', { name: 'Accept' }).click()
	const consentDecline = page.getByRole('button', { name: 'Decline' })
	if (await consentDecline.isVisible().catch(() => false)) {
		await consentDecline.click()
	}
}

test('1.1: no inr-ahpop cookie - modal opens automatically on the homepage', async ({ page }) => {
	await page.goto('/')

	await expect(antiHateDialog(page)).toBeVisible()
})

test('1.2: inr-ahpop cookie present - modal does not open', async ({ page, context }) => {
	await page.goto('/')
	await antiHateDialog(page).getByRole('button', { name: 'Accept' }).click()
	await expect(antiHateDialog(page)).not.toBeVisible()

	await page.reload()

	await expect(antiHateDialog(page)).not.toBeVisible()
	const cookies = await context.cookies()
	expect(cookies.find((c) => c.name === 'inr-ahpop')).toBeTruthy()
})

test('1.3: no inr-ahpop cookie - modal does not open on a non-home route', async ({ page }) => {
	await page.goto('/search/us/-122.1/37.4/50/mi')

	await expect(antiHateDialog(page)).not.toBeVisible()
})

test('1.4: clicking Accept sets the cookie (30-day expiry), closes the modal, and the rest of the page becomes interactive', async ({
	page,
	context,
}) => {
	await page.goto('/')

	await antiHateDialog(page).getByRole('button', { name: 'Accept' }).click()

	await expect(antiHateDialog(page)).not.toBeVisible()
	const cookies = await context.cookies()
	const ahpop = cookies.find((c) => c.name === 'inr-ahpop')
	expect(ahpop).toBeTruthy()
	// 30 days, in seconds - allow a small margin for test execution time.
	const expectedExpiry = Date.now() / 1000 + 60 * 60 * 24 * 30
	expect(ahpop?.expires ?? 0).toBeGreaterThan(expectedExpiry - 60)
	expect(ahpop?.expires ?? 0).toBeLessThan(expectedExpiry + 60)

	// "rest of the page becomes interactive" - the modal sets aria-hidden on the rest of the page
	// while open (confirmed via home.spec.ts's own comment on this), so a real interaction target
	// underneath is the practical way to confirm that's lifted.
	await expect(page.getByRole('link', { name: 'InReach logo' }).first()).toBeVisible()
})

test('1.5: the modal has no close (X) button at all - Accept is the only way to dismiss it', async ({
	page,
}) => {
	// Corrects a wrong premise in the inventory doc, found while writing this test: the doc
	// assumed a close-X exists and behaves like Accept. It doesn't exist at all.
	// packages/ui/theme/common.tsx sets `withCloseButton: false` as the *theme-wide default* for
	// every Modal in the app (Mantine's own default is `true`) - AntiHateMessage.tsx doesn't
	// override it back on, so `hasHeader` (Mantine's Modal.mjs: `!!title || withCloseButton`) is
	// false here (no `title` prop either), and no header/close-button markup renders at all.
	// Confirmed via a direct DOM dump of the dialog's innerHTML showing no header element.
	await page.goto('/')

	await expect(antiHateDialog(page).getByRole('button', { name: 'Close' })).toHaveCount(0)
	await expect(antiHateDialog(page)).toBeVisible()
})

test('1.6: pressing Escape or clicking outside does not dismiss the modal', async ({ page }) => {
	await page.goto('/')

	await page.keyboard.press('Escape')
	await expect(antiHateDialog(page)).toBeVisible()

	// Click somewhere clearly outside the modal content (the overlay).
	await page.mouse.click(5, 5)
	await expect(antiHateDialog(page)).toBeVisible()
})

test('1.8: on a mobile viewport, the modal renders fullscreen, not a centered dialog', async ({ page }) => {
	await page.setViewportSize({ width: 400, height: 800 })
	await page.goto('/')

	// `fullScreen={isMobile}` (AntiHateMessage.tsx) maps to Mantine's own `data-full-screen`
	// attribute on the modal content element - a more reliable signal here than measuring
	// rendered pixel dimensions, since this page mounts a second (closed) Modal with the same
	// role that complicates bounding-box comparisons.
	await expect(antiHateDialog(page)).toHaveAttribute('data-full-screen', 'true')
})

test("1.9: viewing the footer's separate anti-hate copy does not set the inr-ahpop cookie", async ({
	page,
	context,
}) => {
	await page.goto('/')
	await dismissAntiHateAndConsent(page)
	await context.clearCookies()

	// A real <a> tag (confirmed via DOM dump), but not reliably found via `getByRole('link',
	// {name})` in this app's markup - `getByText` matches the same element more reliably here.
	await page.getByText('Anti-hate commitment').first().click()
	await expect(page.getByRole('dialog').filter({ hasText: 'harmful, hate-based' })).toBeVisible()

	const cookies = await context.cookies()
	expect(cookies.find((c) => c.name === 'inr-ahpop')).toBeUndefined()
})
