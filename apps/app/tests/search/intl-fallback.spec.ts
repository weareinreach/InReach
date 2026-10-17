import { expect, test } from '@playwright/test'

/**
 * Section 13 of docs/Testing/search-test-inventory.md - the international/out-of-service-area fallback pages,
 * against the real running app. `search/intl/index.tsx` (no country) and `search/intl/[country].tsx`
 * (specific country) are apps/app page components, not packages/ui components - no Vitest harness exists for
 * rendering apps/app pages directly (same reasoning as section 12's responsive tests), so this uses
 * Playwright throughout rather than inventing one.
 */
test("13.1: a country InReach doesn't serve shows its localized name and international crisis resources", async ({
	page,
}) => {
	// Uppercase: the app's own redirect that would ever send a real user here
	// (apps/app/src/proxy.ts) always uppercases the country code first - see 13.1b below for what
	// happens with a lowercase code instead.
	await page.goto('/search/intl/JP')

	// Intl.DisplayNames('en', { type: 'region' }).of('JP') -> "Japan" - confirmed via node before
	// writing this assertion, not assumed.
	await expect(page.getByText('InReach does not operate in Japan')).toBeVisible()
})

test('13.1b: a lowercase country code redirects to the uppercase form', async ({ page }) => {
	// #2067 - a direct visit to a lowercase `/search/intl/<code>` (not reachable through any of the
	// app's own links; only via a typed/bookmarked/shared URL) used to reach [country].tsx as-is,
	// which had no normalization: `Intl.DisplayNames.of('jp')` silently returns the literal string
	// "jp" instead of resolving it to "Japan", and the same raw value fed a case-sensitive DB
	// lookup that would've silently matched zero crisis-support orgs for ANY lowercase code, not
	// just a wrong heading. Fixed at the edge (`apps/app/src/proxy.ts`) with the same
	// redirect-to-canonical-uppercase pattern already used for the sibling `/search/<code>` route,
	// so the page itself never sees a bad-case value for any real visit.
	await page.goto('/search/intl/jp')

	await expect(page).toHaveURL(/\/search\/intl\/JP$/)
	await expect(page.getByText('InReach does not operate in Japan')).toBeVisible()
})

test('13.2: US/CA/MX redirect client-side to the real results page with a zeroed tuple', async ({ page }) => {
	await page.goto('/search/intl/us')

	await expect(page).toHaveURL(/\/search\/US\/0\/0\/0\/mi/)
})

test('13.3: ServiceFilter/MoreFilter render but are disabled on the intl fallback pages', async ({
	page,
}) => {
	await page.goto('/search/intl/JP')

	await expect(page.getByRole('button', { name: 'Filter by services' })).toBeDisabled()
	await expect(page.getByRole('button', { name: 'More options' })).toBeDisabled()
})

test('13.4: intl/index.tsx (no country) shows the "coming soon" overlay on the sidebar', async ({ page }) => {
	await page.goto('/search/intl')

	await expect(page.getByText('Coming soon')).toBeVisible()
})

test('13.5: intl/[country].tsx does not show the "coming soon" overlay (isAdvanced=true), despite resultCount always being 0', async ({
	page,
}) => {
	// Flagged in the inventory as "decide if this inconsistency between the two intl pages is
	// intentional before locking in as expected" - documenting current actual behavior, not
	// asserting it's the right design. The sidebar's switches are unusable either way, since
	// there's never anything to sort (resultCount is hardcoded to 0), just via a different visual
	// treatment than intl/index.tsx's overlay.
	await page.goto('/search/intl/JP')

	await expect(page.getByText('Coming soon')).not.toBeVisible()
	await expect(page.getByText('Sort by LGBTQ+ community focus')).toBeVisible()
})

test('13.6: an invalid (non-2-char) country param returns a real 404', async ({ page }) => {
	const response = await page.goto('/search/intl/usa')

	expect(response?.status()).toBe(404)
})

test("13.7/13.8/13.9: intl/index.tsx's own tablet-only (sm, 768px) result-count row", async ({ page }) => {
	// This is the one genuine tablet-only JS branch anywhere in the search surface - distinct from
	// every other search page's `xs` (500px) mobile check. `useMediaQuery` uses a `max-width`
	// query, so 768px itself should still match (inclusive upper bound) - 13.9's boundary check.
	//
	// Scoped to `.searchControls` (index.module.css/index.tsx), not a bare text search: the
	// desktop sidebar (SearchResultSidebar, always in the DOM, CSS-hidden below its own 768px
	// breakpoint) shows its own separate "N results" text whenever it isn't in `onlySort` mode, so
	// an unscoped `getByText` can match that one instead of the row this case is actually about.
	const countRow = page.locator('[class*="searchControls"]').getByText(/^\d+ results?$/)

	await page.setViewportSize({ width: 900, height: 900 })
	await page.goto('/search/intl')
	await expect(countRow).not.toBeVisible()

	await page.setViewportSize({ width: 600, height: 900 })
	await page.reload()
	await expect(countRow).toBeVisible()

	await page.setViewportSize({ width: 768, height: 900 })
	await page.reload()
	await expect(countRow).toBeVisible()
})
