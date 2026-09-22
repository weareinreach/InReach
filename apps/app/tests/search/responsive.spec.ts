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

test('12.1: below the xs breakpoint (500px), the mobile-only result count row and sort button render', async ({
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

test('12.2: at/above the xs breakpoint, the desktop sidebar renders as a persistent column with no sort-drawer trigger', async ({
	page,
}) => {
	await page.setViewportSize({ width: 900, height: 900 })
	await page.goto(GOOD_URL)

	await expect(page.getByText('Sort by LGBTQ+ community focus')).toBeVisible()
	await expect(page.getByRole('button', { name: 'Sort results' })).not.toBeVisible()
})

test('12.dead-zone: between 500px and 768px, neither the desktop sidebar nor the mobile sort controls render', async ({
	page,
}) => {
	// Correctly fails: confirms a real gap. The mobile-only result-count row and sort button are
	// gated on the JS `isMobile` check (`useMediaQuery('(max-width: ${theme.breakpoints.xs})')` -
	// 500px), but the desktop sidebar's `Grid.Col` is hidden via a *different*, CSS-only
	// breakpoint (`.hideMobile` in the page's own module.css, `@media (min-width:
	// $mantine-breakpoint-sm)` - 768px). Between those two thresholds, `isMobile` is already
	// `false` (so the mobile-only elements don't render) but the CSS breakpoint hasn't been
	// crossed yet either (so the sidebar stays `display: none`) - a dead zone with no way to
	// sort/filter by community focus at all. Confirmed live at 600px, a common tablet-portrait /
	// large-phone-landscape width.
	await page.setViewportSize({ width: 600, height: 900 })
	await page.goto(GOOD_URL)

	const sidebar = page.getByText('Sort by LGBTQ+ community focus')
	const sortButton = page.getByRole('button', { name: 'Sort results' })

	await expect(sidebar.or(sortButton)).toBeVisible()
})
