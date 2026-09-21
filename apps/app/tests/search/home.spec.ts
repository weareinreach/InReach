import { expect, test } from '@playwright/test'

/**
 * Smoke test for the app shell itself. This is deliberately about the whole page mounting cleanly, not one
 * feature - a webpack/module-resolution bug (e.g. a client bundle throwing `ReferenceError: exports is not
 * defined`) crashes `_app.tsx` before any feature-level code runs, and that class of bug is invisible to unit
 * tests and even to a clean `next build` - it only shows up when real JS executes in a real browser.
 */
test('home page loads with no console or page errors', async ({ page }) => {
	const errors: string[] = []
	page.on('pageerror', (err) => errors.push(err.message))
	page.on('console', (msg) => {
		if (msg.type() === 'error') errors.push(msg.text())
	})

	const response = await page.goto('/')
	expect(response?.status()).toBeLessThan(400)

	// First-visit modal marks the rest of the page aria-hidden until dismissed, which hides the
	// header from role-based queries below even though it's already rendered underneath.
	await page.getByRole('dialog').getByRole('button', { name: 'Accept' }).click()

	// Confirms the app shell actually mounted and rendered real content, not a blank/crashed page.
	await expect(page.getByRole('link', { name: 'InReach logo' }).first()).toBeVisible()

	expect(errors).toEqual([])
})

test('search by location triggers results', async ({ page }) => {
	await page.goto('/')

	// First-visit modal blocks interaction with the rest of the page until dismissed.
	await page.getByRole('dialog').getByRole('button', { name: 'Accept' }).click()

	// Mantine's `Combobox.Target` only sets `role="combobox"` on its child input when
	// `withExpandedAttribute` is passed - `SearchBox.tsx` doesn't pass it, so the input's real
	// accessible role stays the implicit `textbox` a plain `<input>` gets. Confirmed against the
	// installed @mantine/core 9.5.1 source (`use-combobox-target-props.mjs`), not assumed.
	const searchInput = page.getByRole('textbox', { name: /search by city or zip/i })
	await searchInput.fill('Los Gatos')

	// The autocomplete dropdown populates from a debounced geocoding API call, not instantly.
	// While that's in flight, `SearchBox` renders a single loading-placeholder option (a bare
	// `Loader`, no text - see SearchBox.tsx's `fetching` branch) that also satisfies
	// `getByRole('option')`. Its `value` is just the raw typed text, which won't match any real
	// result once the API responds, so clicking it silently does nothing (no error, no nav) -
	// filtering for text content targets a real result instead of that transient placeholder.
	const firstOption = page.getByRole('option').filter({ hasText: /\w/ }).first()
	await expect(firstOption).toBeVisible({ timeout: 10_000 })
	await firstOption.click()

	await expect(page).toHaveURL(/\/search\//, { timeout: 10_000 })
})
