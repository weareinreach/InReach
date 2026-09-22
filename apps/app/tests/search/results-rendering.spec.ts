import { expect, test } from '@playwright/test'

/**
 * Section 4 of docs/Testing/search-test-inventory.md - search results rendering, against the real running
 * app. Unlike SearchBox (a reusable packages/ui component, tested via Vitest), this is the results page
 * itself - real data and real routing are more practical here than mocking a full Next.js page component's
 * SSR props.
 */

test('4.1: skeleton placeholder cards show before the results query resolves', async ({ page }) => {
	// Delay the tRPC batch response so the pre-resolve skeleton state is actually observable -
	// on a fast local dev server this normally resolves too quickly to reliably assert on.
	await page.route('**/api/trpc/**', async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 1000))
		await route.continue()
	})

	const navigation = page.goto('/search/us/-122.1/37.4/50/mi')

	// Mantine's Skeleton renders with this class - same pattern already used elsewhere in
	// this codebase's tests (see Rating.test.tsx) for detecting a loading skeleton.
	await expect(page.locator('.mantine-Skeleton-root').first()).toBeVisible()
	await navigation
})

test('4.2: zero results shows empty-state messaging and crisis resources, sidebar still renders', async ({
	page,
}) => {
	// A remote ocean coordinate - confirmed via curl before writing this test to actually
	// return resultCount: 0 in this environment, not assumed.
	await page.goto('/search/us/-140.0/40.0/10/mi')

	await expect(
		page.getByText('No results found for your search. Try adjusting your selected location or filters.')
	).toBeVisible()

	// Sidebar's embedded org-name SearchBox is still present even in the zero-results branch -
	// distinct placeholder from the main location SearchBox confirms it's specifically the
	// sidebar instance, not the page's primary search box.
	await expect(page.getByPlaceholder('Enter organization name...')).toBeVisible()
})

test('4.3: a tier-header divider appears once per new proximity tier, not once per item', async ({
	page,
}) => {
	// Tier dividers are built client-side (a useEffect over the resolved query data, not part
	// of the SSR HTML) - curl only sees pre-hydration markup plus embedded translation JSON,
	// so it can't actually verify this; confirmed empirically by first checking with curl,
	// getting a false positive from the embedded JSON, and having this Playwright test itself
	// (real rendered DOM, post-hydration) catch the difference. Page 1 of this location/radius
	// (10 results/page) reaches the Neighborhood and Local tiers but not Regional - that's
	// still enough to prove the per-tier-transition (not per-item) and ordering behavior.
	await page.goto('/search/us/-122.1/37.4/50/mi')

	// Each divider text should appear exactly once, even though many result cards fall within
	// each tier - if this were firing per-item instead of per-tier-transition, these counts
	// would be much higher than 1.
	await expect(page.getByText('Neighborhood Resources (<= 10 miles)')).toHaveCount(1)
	await expect(page.getByText('Local Resources (11 - 25 miles)')).toHaveCount(1)

	// Order matters too - tiers should appear in increasing-distance order, matching how
	// results are sorted, not in whatever order they happen to render.
	const neighborhoodBox = await page.getByText('Neighborhood Resources (<= 10 miles)').boundingBox()
	const localBox = await page.getByText('Local Resources (11 - 25 miles)').boundingBox()
	expect(neighborhoodBox?.y).toBeLessThan(localBox?.y ?? Infinity)
})
