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
	// The URL deliberately has no `?page=` - a fresh search, the overwhelmingly common case. The
	// effect's guard used to start with `router.query.page &&`, which is falsy here, so the
	// prefetch never fired from page 1 (#2065).
	const prefetchRequest = page.waitForRequest(
		(req) => req.url().includes('organization.searchDistance') && req.url().includes('%22skip%22%3A10'),
		{ timeout: 5000 }
	)

	await page.goto(GOOD_URL)

	await expect(prefetchRequest).resolves.toBeTruthy()

	// The point of the prefetch: clicking page 2 is served from the cache (queries are fresh for 10
	// minutes - staleTime in apps/app/src/utils/api.ts) instead of waiting on a second request.
	let page2Requests = 0
	page.on('request', (req) => {
		if (req.url().includes('organization.searchDistance') && req.url().includes('%22skip%22%3A10')) {
			page2Requests++
		}
	})
	await page.getByText('2', { exact: true }).first().click()
	await expect(page).toHaveURL(/[?&]page=2/)
	await expect(page.getByText('2', { exact: true }).first()).toHaveClass(/paginationActive/)
	// Proving a request does *not* happen needs an observation window; 'networkidle' never settles
	// on this page (background polling), so give a background refetch a bounded chance to show up.
	await page.waitForTimeout(2000)
	expect(page2Requests).toBe(0)
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
