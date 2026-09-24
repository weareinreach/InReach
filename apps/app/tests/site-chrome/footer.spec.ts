import { expect, type Page, test } from '@playwright/test'

/**
 * Section 4 of docs/Testing/site-chrome-test-inventory.md - the footer (`Footer`,
 * packages/ui/components/sections/Footer.tsx, rendered unconditionally in `_app.tsx`), against the real
 * running app.
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

test('4.1: clicking "Suggest an organization" navigates to /suggest', async ({ page }) => {
	await page.goto('/')
	await dismissAntiHate(page)

	// A real click, not `dispatchEvent`: this is a Next.js `<Link>`, whose own click interceptor
	// checks real event properties (button, modifier keys) that a synthetic dispatched event
	// doesn't satisfy - confirmed directly, `dispatchEvent('click')` here silently does nothing.
	await page.getByText('Suggest an organization').click()

	await expect(page).toHaveURL('/suggest')
})

test('4.2: external footer links and social icons open in a new tab', async ({ page }) => {
	await page.goto('/')
	await dismissAntiHate(page)

	const donateLink = page.getByText('Donate to InReach', { exact: false })
	await expect(donateLink).toHaveAttribute('target', '_blank')

	const facebookLink = page.getByRole('link', { name: 'Facebook' })
	await expect(facebookLink).toHaveAttribute('target', '_blank')
	await expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/weareinreach')
})

test('4.3: "Privacy statement" opens PrivacyStatementModal in place, not a navigation', async ({ page }) => {
	await page.goto('/')
	await dismissAntiHate(page)

	await page.getByText('Privacy statement').dispatchEvent('click')

	await expect(page.getByRole('heading', { name: 'Privacy Statement' })).toBeVisible()
	await expect(page).toHaveURL('/')
})

test('4.4: "Anti-hate commitment" opens its own content modal without setting inr-ahpop', async ({
	page,
	context,
}) => {
	// The "doesn't set the cookie" half of this is already covered by
	// tests/site-chrome/anti-hate-modal.spec.ts's case 1.9 - this confirms the modal itself opens.
	await page.goto('/')
	await dismissAntiHate(page)
	await context.clearCookies()

	await page.getByText('Anti-hate commitment').dispatchEvent('click')

	await expect(page.getByText('harmful, hate-based', { exact: false })).toBeVisible()
	const cookies = await context.cookies()
	expect(cookies.find((c) => c.name === 'inr-ahpop')).toBeUndefined()
})

test('4.5: "Digital accessibility" opens its own content modal', async ({ page }) => {
	await page.goto('/')
	await dismissAntiHate(page)

	await page.getByText('Digital accessibility').dispatchEvent('click')

	await expect(page.getByRole('dialog')).toBeVisible()
})

test('4.6: "Disclaimer" opens its own content modal', async ({ page }) => {
	await page.goto('/')
	await dismissAntiHate(page)

	await page.getByText('Disclaimer').dispatchEvent('click')

	await expect(page.getByRole('dialog')).toBeVisible()
})

test('4.7: the copyright text shows the current year, not a hardcoded one', async ({ page }) => {
	await page.goto('/')
	await dismissAntiHate(page)

	const currentYear = new Date().getFullYear().toString()
	await expect(page.getByText(currentYear, { exact: false })).toBeVisible()
})

test('4.8: the footer is present on multiple different page types', async ({ page }) => {
	await page.goto('/')
	await dismissAntiHate(page)
	await expect(page.getByText('Suggest an organization')).toBeVisible()

	await page.goto('/search/us/-122.1/37.4/50/mi')
	await expect(page.getByText('Suggest an organization')).toBeVisible()
})

test('4.9: "Powered by Vercel" has no target=_blank, unlike every other external footer link', async ({
	page,
}) => {
	// Correctly fails: confirms a real inconsistency. Every other external footer link uses the
	// app's own `Link` component (packages/ui/components/core/Link.tsx), which always sets
	// `target='_blank'` for anything external - the Vercel link is a raw, unwrapped `<a>` tag
	// (Footer.tsx) with no `target` attribute at all, so clicking it navigates away in the same
	// tab instead of opening a new one like its siblings (Donate, the social icons, etc.). Filed
	// as https://github.com/weareinreach/InReach/issues/2071.
	await page.goto('/')
	await dismissAntiHate(page)

	const vercelLink = page.locator('a:has(img[alt="Powered by Vercel"])')
	await expect(vercelLink).toHaveAttribute('target', '_blank')
})

test('4.10: the footer logo has no link wrapper around it (asymmetric with the navbar logo)', async ({
	page,
}) => {
	// Documents current actual behavior - flagged in the inventory for product/design
	// confirmation, not asserted here as either correct or a bug.
	await page.goto('/')
	await dismissAntiHate(page)

	const footerLogo = page.getByAltText('InReach logo').last()
	await expect(footerLogo).toBeVisible()
	const wrappedInLink = await footerLogo.evaluate((el) => el.closest('a') !== null)
	expect(wrappedInLink).toBe(false)
})

test('4.11: the footer column layout adapts between mobile and desktop without overlap', async ({ page }) => {
	await page.goto('/')
	await dismissAntiHate(page)

	// Scoped to `[class*="background"]` (Footer.tsx's own root div): an unscoped text match for
	// "Support" also matches the mobile nav's own "Support" tab elsewhere on the page.
	const footer = page.locator('[class*="background"]')

	await page.setViewportSize({ width: 1280, height: 900 })
	const supportHeadingDesktop = footer.getByText('Support', { exact: true })
	const connectHeadingDesktop = footer.getByText('Connect', { exact: true })
	const desktopSupportBox = await supportHeadingDesktop.boundingBox()
	const desktopConnectBox = await connectHeadingDesktop.boundingBox()
	// Side-by-side columns on desktop - Connect should be to the right of Support, same row.
	expect(desktopConnectBox?.x).toBeGreaterThan(desktopSupportBox?.x ?? 0)

	// Correctly fails: confirms a real, high-impact bug, not just a layout nit. Below (and
	// including) the `sm` breakpoint (768px), the entire footer container collapses to a 0x0
	// bounding box - not merely restyled or reflowed, genuinely zero width and height - confirmed
	// directly across 768px, 600px, and 400px, and on both `/` and the search results page. Root
	// cause not fully traced to a specific rule (`Footer.tsx`'s own CSS module has no `sm`-keyed
	// rule at all - the collapse appears to originate further up the layout tree), but the effect
	// itself is unambiguous and easy to reproduce. Filed as
	// https://github.com/weareinreach/InReach/issues/2070.
	await page.setViewportSize({ width: 400, height: 1200 })
	const supportHeadingMobile = footer.getByText('Support', { exact: true })
	const connectHeadingMobile = footer.getByText('Connect', { exact: true })
	await expect(supportHeadingMobile).toBeVisible()
	await expect(connectHeadingMobile).toBeVisible()
})
