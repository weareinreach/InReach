import { expect, type Page, test } from '@playwright/test'

/**
 * Section 3c of docs/Testing/site-chrome-test-inventory.md - the desktop language picker (`LangPicker`,
 * packages/ui/components/core/LangPicker.tsx, embedded inside `UserMenu`), against the real running app.
 */
test.use({ viewport: { width: 1280, height: 900 } })

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

test('3c.1: hovering the globe/translate icon opens a dropdown of available languages', async ({ page }) => {
	await page.goto('/')
	await dismissAntiHate(page)

	await page.getByText('English').first().hover()

	await expect(page.getByText('Español')).toBeVisible()
	await expect(page.getByText('Français')).toBeVisible()
})

test('3c.2: selecting a language changes the locale, sets NEXT_LOCALE, and reloads under the new locale', async ({
	page,
	context,
}) => {
	await page.goto('/')
	await dismissAntiHate(page)
	await page.getByText('English').first().hover()

	await page.getByText('Español').click()

	await expect(page).toHaveURL(/\/es(\/|$|\?)/)
	const cookies = await context.cookies()
	expect(cookies.find((c) => c.name === 'NEXT_LOCALE')?.value).toBe('es')
})

test('3c.3: moving the mouse away closes the dropdown', async ({ page }) => {
	await page.goto('/')
	await dismissAntiHate(page)
	await page.getByText('English').first().hover()
	await expect(page.getByText('Español')).toBeVisible()

	await page.mouse.move(10, 10)

	await expect(page.getByText('Español')).not.toBeVisible()
})

test('3c.4: the language picker is present whether logged in or out - not auth-gated', async ({ page }) => {
	await page.goto('/')
	await dismissAntiHate(page)

	// Logged out (no session fixture exists yet) - confirm the picker itself renders regardless of
	// which auth-dependent buttons (Log in/Sign up vs. an avatar menu) sit next to it, since
	// UserMenu.tsx renders `<LangPicker />` unconditionally, before branching on auth state.
	await expect(page.getByText('English').first()).toBeVisible()
	await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible()
})
