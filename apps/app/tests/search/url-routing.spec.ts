import { expect, test } from '@playwright/test'

/**
 * Section 1 of docs/Testing/search-test-inventory.md - URL/route parsing on the search results page. A
 * known-good base URL with many results (352 as of this writing, so pagination is always exercisable) - see
 * docs/Testing/search-test-inventory.md §1 for the full case list.
 */
const GOOD_URL = '/search/us/-122.1/37.4/50/mi'

test('1.2: a malformed route does not crash the whole page', async ({ page }) => {
	const response = await page.goto('/search/us/abc/xyz/50/mi')

	// getServerSideProps calls SearchParamsSchema.parse(query.params) - the throwing variant,
	// not .safeParse() - so an invalid tuple currently produces an uncaught ZodError and a raw
	// Next.js 500 page, never reaching the client-side safeParse/"Error" text fallback that
	// exists in the page component. Confirmed against the real app before writing this
	// assertion (curl on the same URL returned 500 with a ZodError body).
	expect(response?.status()).toBeLessThan(500)
})

test('1.3: navigating directly to ?page=3 shows page 3 as active, not page 1', async ({ page }) => {
	await page.goto(`${GOOD_URL}?page=3`)

	// The active page renders as plain text (not a link), styled via `.paginationActive` -
	// unlike every other page number, which renders as an <a> with no href (onClick-only, per
	// Pagination.tsx) and so has no accessible link role - getByText, not getByRole('link').
	await expect(page.getByText('3', { exact: true }).first()).toHaveClass(/paginationActive/)
})

test('1.4: a non-numeric ?page= value does not crash the page', async ({ page }) => {
	const response = await page.goto(`${GOOD_URL}?page=abc`)

	// PageIndexSchema = z.coerce.number().default(1) - the .default(1) only applies when the
	// param is absent. When present but non-numeric, z.coerce.number() produces NaN, which
	// zod's number validator rejects, and .parse() throws rather than falling back to 1.
	// Confirmed against the real app (curl returned 500) before writing this assertion.
	expect(response?.status()).toBeLessThan(500)
})

test('1.5: clicking a pagination link updates ?page= via a shallow route change', async ({ page }) => {
	await page.goto(GOOD_URL)

	const pageTwoLink = page.getByText('2', { exact: true }).first()
	await pageTwoLink.click()

	await expect(page).toHaveURL(/[?&]page=2\b/)
	// Pagination.tsx's pageChangeHandler passes { shallow: true } - a shallow route change
	// does not re-run getServerSideProps, so the page should update without a full navigation.
	// Playwright's toHaveURL already waits for the client-side URL update; a full reload would
	// still satisfy that assertion, so also confirm the active-page text updated in place.
	await expect(page.getByText('2', { exact: true }).first()).toHaveClass(/paginationActive/)
})
