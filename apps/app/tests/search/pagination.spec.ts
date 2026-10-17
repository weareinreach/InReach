import { expect, test } from '@playwright/test'

/**
 * Section 11 of docs/Testing/search-test-inventory.md - Pagination, against the real running app. 11.1
 * (Vitest, correct total page count) and 11.4 (Vitest, total=1 still renders) are covered directly on the
 * component in packages/ui/components/core/Pagination.test.tsx. 11.3's core claim (clicking a page number
 * updates ?page= via a shallow route change) is already covered by tests/search/url-routing.spec.ts's case
 * 1.5 - only the "scrolls to top" part of 11.3 is new here.
 */
const GOOD_URL = '/search/us/-122.1/37.4/50/mi'

test("11.2: while below the last page, the next page's data is prefetched in the background", async ({
	page,
}) => {
	// apps/app/src/pages/search/[...params]/index.tsx: a `useEffect` calls
	// `apiUtils.organization.searchDistance.prefetch({..., skip: nextSkip, ...})` whenever the
	// current page is below the total page count - `nextSkip` is `currentPage *
	// SEARCH_RESULT_PAGE_SIZE` (10), i.e. the *next* page's offset. On page 1 of this 352-result
	// search (36 pages), that's skip=10.
	//
	// Correctly fails: confirms a real bug. The effect's guard is
	// `if (router.query.page && PageIndexSchema.parse(router.query.page) < ...)` - `router.query.page`
	// is `undefined` (falsy) on a fresh search with no `?page=` in the URL, which is the normal,
	// overwhelmingly common case (nobody arrives at a first search with `?page=1` already in the
	// URL) - so the prefetch never fires here. Confirmed the mechanism itself does work: navigating
	// with an explicit `?page=1` in the URL does trigger the prefetch (skip=10 visible in the
	// request), isolating the guard's falsy-check as the root cause, not the prefetch logic itself.
	const prefetchRequest = page.waitForRequest(
		(req) => req.url().includes('organization.searchDistance') && req.url().includes('%22skip%22%3A10'),
		{ timeout: 5000 }
	)

	await page.goto(GOOD_URL)

	await expect(prefetchRequest).resolves.toBeTruthy()
})

test('11.3: clicking a pagination link scrolls the page to top', async ({ page }) => {
	await page.goto(GOOD_URL)

	// Scroll down first so a reset to 0 is actually observable, not just already-0.
	await page.evaluate(() => window.scrollTo(0, 800))
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

	await page.getByText('2', { exact: true }).first().click()

	// Pagination.tsx's pageChangeHandler passes `{ shallow: true, scroll: true }` to
	// router.replace - Next.js's `scroll: true` resets window scroll position on the route
	// change.
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})
