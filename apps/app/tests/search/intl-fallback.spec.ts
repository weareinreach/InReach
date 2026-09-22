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

test("13.1b: a lowercase country code doesn't resolve to a display name", async ({ page }) => {
	// Correctly fails: confirms a real (if narrow) gap. `[country].tsx`'s
	// `QuerySchema = z.object({ country: z.string().length(2) })` accepts any 2-char string,
	// case included, but the heading calls `Intl.DisplayNames.of(router.query.country)` on the
	// RAW query value with no normalization - `Intl.DisplayNames` requires an uppercase (or
	// otherwise canonical) region subtag and silently echoes back an unrecognized one instead of
	// resolving it (confirmed directly: `Intl.DisplayNames('en',{type:'region'}).of('jp')` returns
	// the literal string "jp", not "Japan"). Not reachable through the app's own normal flow
	// (apps/app/src/proxy.ts always uppercases before building this URL), but reachable by anyone
	// who reaches this route directly with a lowercase code in the URL. Filed as
	// https://github.com/weareinreach/InReach/issues/2067.
	await page.goto('/search/intl/jp')

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
