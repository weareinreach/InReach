import { expect, test } from '@playwright/test'

/**
 * `savedList.getById` resolves to `null` (not an error) for a list id that doesn't exist, or exists but isn't
 * owned by/shared with the signed-in user. `/account/saved/[listId].tsx` redirects away on `null` via a
 * `useEffect`, but effects only run after the render that received the `null` commits - the page used to
 * crash on that one render instead of handling it. Runs authenticated (see `crud` project in
 * playwright.config.ts and tests/crud/auth.setup.ts).
 */
test.describe('account/saved/[listId]', () => {
	test('a list id that does not exist redirects to /account/saved instead of crashing', async ({ page }) => {
		const errors: string[] = []
		page.on('pageerror', (error) => errors.push(error.message))

		await page.goto('/account/saved/ulst_01JZRYZ6GFYFZZ3RANZ4DCW6N')

		await page.waitForURL('**/account/saved')
		await expect(page.getByText(/application error/i)).not.toBeVisible()
		expect(errors).toEqual([])
	})

	test('the signed-in test account can load its own saved-lists page', async ({ page }) => {
		const errors: string[] = []
		page.on('pageerror', (error) => errors.push(error.message))

		await page.goto('/account/saved')

		await expect(page).toHaveURL(/\/account\/saved$/)
		expect(errors).toEqual([])
	})
})
