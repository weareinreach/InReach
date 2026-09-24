import { expect, type Page, test } from '@playwright/test'

/**
 * Section 3e of docs/Testing/site-chrome-test-inventory.md - the login/signup modals
 * (`packages/ui/modals/LoginSignUp/index.tsx`), against the real running app. Only opening these modals is
 * exercised here - actually completing a login needs a real backend session, which these tests don't attempt
 * (same reason most of §3d is blocked on a missing auth fixture).
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

test('3e.1: clicking "Log in" opens the login modal with Privacy Policy, forgot-password, and sign-up-instead links', async ({
	page,
}) => {
	await page.goto('/')
	await dismissAntiHate(page)

	await page.getByRole('button', { name: 'Log in' }).dispatchEvent('click')

	const dialog = page.getByRole('dialog')
	await expect(dialog.getByText('Privacy Policy')).toBeVisible()
	await expect(dialog.getByText('Forgot password?')).toBeVisible()
	await expect(dialog.getByText("Don't have an account?")).toBeVisible()
})

test('3e.2: clicking "Sign up for free" opens the signup modal', async ({ page }) => {
	await page.goto('/')
	await dismissAntiHate(page)

	await page.getByRole('button', { name: 'Sign up for free' }).dispatchEvent('click')

	// Corrects a wrong premise, found while writing this test: the doc expected an immediate
	// Privacy Statement link, but this modal's real first step is an account-type choice
	// (Individual vs. Professional/Provider) - the privacy link only appears once one is picked
	// and the actual account-details form loads, which is out of scope for "does the modal open."
	const dialog = page.getByRole('dialog')
	await expect(dialog.getByRole('button', { name: 'Individual' })).toBeVisible()
	await expect(dialog.getByRole('button', { name: 'Professional/Provider' })).toBeVisible()
})

test('3e.3: from the login modal, clicking "sign up instead" replaces it with the signup modal', async ({
	page,
}) => {
	await page.goto('/')
	await dismissAntiHate(page)
	await page.getByRole('button', { name: 'Log in' }).dispatchEvent('click')
	await expect(page.getByRole('dialog').getByText("Don't have an account?")).toBeVisible()

	await page.getByRole('dialog').getByText("Don't have an account?").dispatchEvent('click')

	const dialog = page.getByRole('dialog')
	await expect(dialog.getByRole('button', { name: 'Individual' })).toBeVisible()
	await expect(dialog.getByRole('button', { name: 'Professional/Provider' })).toBeVisible()
})
