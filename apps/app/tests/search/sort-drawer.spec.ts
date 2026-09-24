import { expect, test } from '@playwright/test'

/**
 * Section 10 of docs/Testing/search-test-inventory.md - the mobile "sort" drawer (`SortResults`), against the
 * real running app. `isMobile` (apps/app/src/pages/search/[...params]/index.tsx) comes from
 * `useMediaQuery('(max-width: ${theme.breakpoints.xs})')`, and `theme.breakpoints.xs` is `em(500)`
 * (packages/ui/theme/common.tsx) - a 400px-wide viewport is safely under that.
 */
test.use({ viewport: { width: 400, height: 800 } })

test('10.1: on a mobile viewport, a "sort" button is visible above the result list', async ({ page }) => {
	await page.goto('/search/us/-122.1/37.4/50/mi')

	await expect(page.getByRole('button', { name: 'Sort results' })).toBeVisible()
})

test('10.2: tapping the sort button opens a drawer with the same focus-switch controls as the desktop sidebar', async ({
	page,
}) => {
	await page.goto('/search/us/-122.1/37.4/50/mi')

	await page.getByRole('button', { name: 'Sort results' }).click()

	await expect(page.getByRole('heading', { name: 'Sort results' })).toBeVisible()
	// Same focus-switch labels the desktop sidebar renders (SearchResultSidebar.tsx's
	// SIDEBAR_TAG_CONFIG), confirming the drawer really does reuse the shared component in
	// `onlySort` mode rather than a separate, possibly-diverging implementation.
	await expect(page.getByRole('switch', { name: 'BIPOC community' })).toBeVisible()
})

// 10.3 ("resultCount === 0 -> Sort button is disabled") is NOT tested here against the real page:
// `data?.resultCount === 0 && crisisResults` (index.tsx) always renders <NoResults> instead of the
// results block (SortResults included) whenever it's zero - and `crisisResults` comes from
// `api.organization.getNatlCrisis({ cca2: country })`, a *country-level* query, confirmed via a
// real zero-result US search (-140.0/40.0/10/mi) to return crisis data every time. So on the main
// search page, resultCount===0 with SortResults still mounted appears to be unreachable for any
// country with national crisis-support data - not a real gap to chase further here. The
// component's own `disabled` passthrough behavior (SortResults.tsx has no internal resultCount
// check of its own) is covered directly at the component level instead, in
// packages/ui/components/sections/SortResults.test.tsx.
