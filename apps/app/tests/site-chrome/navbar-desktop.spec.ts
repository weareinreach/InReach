import { expect, type Page, test } from '@playwright/test'

/**
 * Section 3a of docs/Testing/site-chrome-test-inventory.md - the desktop navbar (`Navbar`,
 * packages/ui/components/sections/Navbar.tsx, shown >= `sm` breakpoint), against the real running app.
 */

const dismissAntiHate = async (page: Page) => {
	const dialog = page.locator('[role="dialog"]').filter({ hasText: 'Anti-hate commitment' })
	if (await dialog.isVisible().catch(() => false)) {
		// `dispatchEvent`, not `click`: on a narrow/mobile viewport, the cookie-consent banner
		// visually overlaps this button - a real bug, covered separately in
		// cookie-consent.spec.ts's 2.10b. Even `click({ force: true })` still dispatches at the
		// button's on-screen coordinates (so it can land on the banner instead) - dispatching the
		// event directly to the button element sidesteps that, keeping this file's own tests
		// (about the navbar, not this overlap) from being incidentally flaky because of it.
		await dialog.getByRole('button', { name: 'Accept' }).dispatchEvent('click')
		await expect(dialog).not.toBeVisible()
	}
}

test.beforeEach(async ({ context }) => {
	await context.clearCookies()
})

test('3a.1: on a desktop viewport, the logo, UserMenu, and Safety exit button are all visible', async ({
	page,
}) => {
	await page.setViewportSize({ width: 1280, height: 900 })
	await page.goto('/')
	await dismissAntiHate(page)

	await expect(page.getByRole('link', { name: 'InReach logo' }).first()).toBeVisible()
	await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible()
	await expect(page.getByRole('button', { name: 'Safety exit' })).toBeVisible()
})

test('3a.2: clicking the logo navigates to /', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 })
	await page.goto('/search/us/-122.1/37.4/50/mi')
	await dismissAntiHate(page)

	await page.getByRole('link', { name: 'InReach logo' }).first().click()

	await expect(page).toHaveURL('/')
})

test('3a.3: the Safety exit button is a target=_self link to google.com - same tab, not a new one', async ({
	page,
}) => {
	// Answers a question flagged in the inventory doc ("confirm whether this should open in the
	// same tab...or a new tab"): Navbar.tsx sets `target='_self'` explicitly on this link. Checking
	// the attribute directly rather than performing a live navigation to an external domain, which
	// would make this test dependent on google.com's own availability/behavior.
	await page.setViewportSize({ width: 1280, height: 900 })
	await page.goto('/')
	await dismissAntiHate(page)

	const safetyExitLink = page.locator('a:has(#safety-exit)')
	await expect(safetyExitLink).toHaveAttribute('href', 'https://www.google.com')
	await expect(safetyExitLink).toHaveAttribute('target', '_self')
})

test('3a.4: below the sm breakpoint, the desktop navbar is not shown (mobile nav shown instead)', async ({
	page,
}) => {
	await page.setViewportSize({ width: 400, height: 900 })
	await page.goto('/')
	await dismissAntiHate(page)

	await expect(page.getByRole('button', { name: 'Safety exit' })).not.toBeVisible()
	await expect(page.getByRole('tab', { name: 'Support' })).toBeVisible()
})

test('3a.5: at a tablet width (e.g. iPad portrait, 810px), the desktop navbar shows with enough room for logo + menu + safety exit', async ({
	page,
}) => {
	await page.setViewportSize({ width: 810, height: 1080 })
	await page.goto('/')
	await dismissAntiHate(page)

	await expect(page.getByRole('button', { name: 'Safety exit' })).toBeVisible()
	await expect(page.getByRole('tab', { name: 'Support' })).not.toBeVisible()
	// "Enough horizontal room" - confirm the safety-exit button doesn't get squeezed into
	// wrapping/overlapping by checking it's on the same horizontal line as the logo.
	const logoBox = await page.getByRole('link', { name: 'InReach logo' }).first().boundingBox()
	const safetyExitBox = await page.getByRole('button', { name: 'Safety exit' }).boundingBox()
	expect(logoBox).toBeTruthy()
	expect(safetyExitBox).toBeTruthy()
	if (logoBox && safetyExitBox) {
		expect(Math.abs(logoBox.y - safetyExitBox.y)).toBeLessThan(logoBox.height + safetyExitBox.height)
	}
})

test('3a.6: at exactly the sm boundary (768px), neither the desktop navbar nor the mobile nav renders', async ({
	page,
}) => {
	// Correctly fails: confirms a real bug. Navbar.module.css hides `.desktopNav` via
	// `@media (max-width: $mantine-breakpoint-sm)` and hides `.mobileNav` via
	// `@media (min-width: $mantine-breakpoint-sm)` - both are inclusive of the boundary value
	// itself, so at exactly 768px both media queries match "hide this one," leaving no navbar at
	// all. Confirmed directly: 767px shows the mobile nav, 769px shows the desktop nav, 768px shows
	// neither. Filed as https://github.com/weareinreach/InReach/issues/2069.
	await page.setViewportSize({ width: 768, height: 900 })
	await page.goto('/')
	await dismissAntiHate(page)

	const desktopNav = page.getByRole('button', { name: 'Safety exit' })
	const mobileNav = page.getByRole('tab', { name: 'Support' })
	await expect(desktopNav.or(mobileNav)).toBeVisible()
})
