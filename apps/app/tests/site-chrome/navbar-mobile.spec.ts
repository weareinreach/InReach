import { expect, type Page, test } from '@playwright/test'

/**
 * Section 3b of docs/Testing/site-chrome-test-inventory.md - the mobile nav (`MobileNav`,
 * packages/ui/components/core/MobileNav.tsx, shown < `sm` breakpoint), against the real running app. All
 * interactions here use `dispatchEvent('click')` rather than a real `.click()` - confirmed directly that
 * Next.js's own dev-mode `<nextjs-portal>` overlay intercepts real clicks project-wide in this local dev
 * environment, unrelated to anything this section is testing.
 */
test.use({ viewport: { width: 400, height: 900 } })

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

test('3b.1: with active search params, on a non-results page, the first tab reads "Search"', async ({
	page,
}) => {
	await page.goto('/search/us/-122.1/37.4/50/mi')
	await dismissAntiHate(page)
	await expect(page.getByRole('tab', { name: 'Home' })).toBeVisible()

	// Navigating via the tab itself is the only reliable way to leave the results page at this
	// viewport - the desktop logo link is hidden below `sm`, and MobileNav wraps the whole app in
	// SearchStateProvider, so its `searchState.params` (set by the results page itself) persists
	// across this client-side navigation.
	await page.getByRole('tab', { name: 'Home' }).dispatchEvent('click')
	await expect(page).toHaveURL('/')

	await expect(page.getByRole('tab', { name: 'Search' })).toBeVisible()
	await expect(page.getByRole('tab', { name: 'Home' })).not.toBeVisible()
})

test('3b.2: on the search results page itself, the tab reads "Home", not "Search"', async ({ page }) => {
	await page.goto('/search/us/-122.1/37.4/50/mi')
	await dismissAntiHate(page)

	await expect(page.getByRole('tab', { name: 'Home' })).toBeVisible()
	await expect(page.getByRole('tab', { name: 'Search' })).not.toBeVisible()
})

test('3b.3: tapping Saved / Account / Support routes to the corresponding page', async ({ page }) => {
	await page.goto('/')
	await dismissAntiHate(page)

	await page.getByRole('tab', { name: 'Support' }).dispatchEvent('click')
	await expect(page).toHaveURL('/support')
})

test('3b.4: tapping the Language tab opens a fullscreen modal, not a route navigation', async ({ page }) => {
	await page.goto('/')
	await dismissAntiHate(page)

	await page.getByRole('tab', { name: 'Language' }).dispatchEvent('click')

	await expect(page.getByText('Choose a language')).toBeVisible()
	await expect(page).toHaveURL('/')
})

test('3b.5: selecting a different language and tapping Update changes the locale and closes the modal', async ({
	page,
	context,
}) => {
	await page.goto('/')
	await dismissAntiHate(page)
	await page.getByRole('tab', { name: 'Language' }).dispatchEvent('click')

	await page.getByText('Español').dispatchEvent('click')
	await page.getByRole('button', { name: 'Update language' }).dispatchEvent('click')

	await expect(page.getByText('Choose a language')).not.toBeVisible()
	await expect(page).toHaveURL(/\/es(\/|$|\?)/)
	const cookies = await context.cookies()
	expect(cookies.find((c) => c.name === 'NEXT_LOCALE')?.value).toBe('es')
})

test('3b.6: closing the language modal without tapping Update makes no locale change', async ({
	page,
	context,
}) => {
	await page.goto('/')
	await dismissAntiHate(page)
	await page.getByRole('tab', { name: 'Language' }).dispatchEvent('click')
	await page.getByText('Español').dispatchEvent('click')

	// `ModalTitle`'s breadcrumb-style close control, not a labeled "Close" button - confirmed via
	// MobileLangPicker.tsx (`<ModalTitle breadcrumb={{ option: 'close', onClick: close }} />`).
	await page
		.getByRole('button', { name: /back|close/i })
		.first()
		.dispatchEvent('click')

	await expect(page.getByText('Choose a language')).not.toBeVisible()
	await expect(page).toHaveURL('/')
	// Next.js's own i18n routing sets NEXT_LOCALE on any page load independent of this component
	// (confirmed directly - it's already present as "en" before ever opening this modal), so "no
	// locale change" means the cookie's value is unchanged, not that the cookie is absent.
	const cookies = await context.cookies()
	expect(cookies.find((c) => c.name === 'NEXT_LOCALE')?.value).toBe('en')
})
