import { expect, test } from '@playwright/test'

/**
 * Section 12 of docs/Testing/search-test-inventory.md - responsive/breakpoint behavior on the search results
 * page, against the real running app. The inventory calls 12.1/12.2 out as "Vitest (mock matchMedia)", but
 * that would mean building a whole new harness for rendering apps/app's page component directly (no such
 * harness exists yet, unlike packages/ui's component-level Vitest setup) - Playwright against the real page,
 * resizing the actual viewport, exercises the exact same `useMediaQuery` code path with no new
 * infrastructure, and is already the established pattern here (see tests/search/sort-drawer.spec.ts).
 */
const GOOD_URL = '/search/us/-122.1/37.4/50/mi'

test('12.1: below the sm breakpoint (768px), the mobile-only result count row and sort button render', async ({
	page,
}) => {
	await page.setViewportSize({ width: 400, height: 800 })
	await page.goto(GOOD_URL)

	await expect(page.getByRole('button', { name: 'Sort results' })).toBeVisible()
	// .first(): the sidebar (CSS-hidden below 768px, but still in the DOM) shows the same
	// "N results" text via its own `count.result` translation, so this text isn't unique to the
	// mobile-only row.
	await expect(page.getByText(/^\d+ results?$/).first()).toBeVisible()
})

test('12.2: at/above the sm breakpoint, the desktop sidebar renders as a persistent column with no sort-drawer trigger', async ({
	page,
}) => {
	await page.setViewportSize({ width: 900, height: 900 })
	await page.goto(GOOD_URL)

	await expect(page.getByText('Sort by LGBTQ+ community focus')).toBeVisible()
	await expect(page.getByRole('button', { name: 'Sort results' })).not.toBeVisible()
})

// #2066: the mobile controls were gated on `xs` (500px) in JS while the sidebar is shown from `sm`
// (768px) in CSS, so 500-768px had neither - no way to sort by community focus at all. Both now switch
// at 768px, matching the navbar (#2069). Checks each side of that exact boundary, plus a common
// tablet-portrait / large-phone-landscape width that used to be in the gap.
for (const { width, expected } of [
	{ width: 600, expected: 'mobile' },
	{ width: 767, expected: 'mobile' },
	{ width: 768, expected: 'desktop' },
] as const) {
	test(`12.dead-zone: at ${width}px, exactly one of the sidebar or the mobile sort controls renders (${expected})`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 900 })
		await page.goto(GOOD_URL)

		const sidebar = page.getByText('Sort by LGBTQ+ community focus')
		const sortButton = page.getByRole('button', { name: 'Sort results' })

		if (expected === 'mobile') {
			await expect(sortButton).toBeVisible()
			await expect(sidebar).not.toBeVisible()
		} else {
			await expect(sidebar).toBeVisible()
			await expect(sortButton).not.toBeVisible()
		}
	})
}

test('12.dead-zone (intl): the out-of-service-area page uses the same 768px switch', async ({ page }) => {
	// apps/app/src/pages/search/intl/[country].tsx had the identical xs-vs-sm mismatch.
	await page.setViewportSize({ width: 600, height: 900 })
	await page.goto('/search/intl/JP')

	await expect(page.getByRole('button', { name: 'Sort results' })).toBeVisible()
	await expect(page.getByText('Sort by LGBTQ+ community focus')).not.toBeVisible()
})
