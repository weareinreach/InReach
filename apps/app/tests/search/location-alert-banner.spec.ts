import { expect, test } from '@playwright/test'

/**
 * Section 14 of docs/Testing/search-test-inventory.md - the results page's territory-based extra margin
 * around the search controls (`showAlertMessage`, apps/app/src/pages/search/[...params]/index.tsx), against
 * the real running app.
 *
 * Case-sensitivity note: `showAlertMessage = [...].includes(country)` compares against an all-uppercase list,
 * and the route's `SearchParamsSchema` (packages/api/schemas/routes/search.ts) does no case normalization of
 * its own - confirmed the margin only applies for an exact-uppercase country code (`/search/US/...` gets it,
 * `/search/us/...` doesn't), matching the same case-sensitivity pattern already filed as #2067 for the intl
 * fallback page. Real navigation (SearchBox's geocode-driven searches) supplies an uppercase code from the
 * DB's `cca2` field, so this is consistent with intended behavior for that path - these tests use uppercase
 * codes to match it, not to paper over the case-sensitivity gap.
 */
test('14.1: a US territory country code gets extra top margin around the search controls', async ({
	page,
}) => {
	await page.goto('/search/PR/-66.5/18.2/50/mi')

	const margin = await page
		.locator('[class*="mantine-Grid-col"]')
		.first()
		.evaluate((el) => window.getComputedStyle(el).marginTop)
	expect(margin).not.toBe('0px')
})

test('14.2: a non-territory country renders without the extra margin', async ({ page }) => {
	await page.goto('/search/FR/2.35/48.85/50/mi')

	const margin = await page
		.locator('[class*="mantine-Grid-col"]')
		.first()
		.evaluate((el) => window.getComputedStyle(el).marginTop)
	expect(margin).toBe('0px')
})
