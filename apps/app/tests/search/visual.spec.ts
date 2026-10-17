import { expect, test } from '@playwright/test'

/**
 * Page-level visual regression, complementing Chromatic's component-level snapshots (see
 * docs/Testing/README.md). Chromatic renders components in isolation from a Storybook story - it can't catch
 * a layout bug that only shows up when real, differently-styled components are actually composed together on
 * a real page. This is deliberately a small starting set (home, search results) per the agreed scope - expand
 * page-by-page as real regressions in untested pages actually surface, not as a big upfront push.
 *
 * Baselines are machine/OS-sensitive (font rendering differs across platforms) - see the Known Issues note in
 * docs/Testing/README.md before trusting a diff generated on a different machine than the committed
 * baseline.
 */

test('home page layout', async ({ page }) => {
	await page.goto('/')
	await page.getByRole('dialog').getByRole('button', { name: 'Accept' }).click()

	// The testimonial carousel auto-advances (embla-carousel-autoplay, 5s interval) - which
	// slide is showing at screenshot time is not deterministic, so it's masked rather than
	// relied on to land in a specific state.
	const carousel = page.getByTestId('home-testimonials-carousel')

	await expect(page).toHaveScreenshot('home.png', { fullPage: true, mask: [carousel] })
})

test('search results page layout', async ({ page }) => {
	// Unlike the home page, the anti-hate modal never appears here - it's homepage-only
	// (see docs/Testing/site-chrome-test-inventory.md §1) - so there's nothing to dismiss.
	await page.goto('/search/us/-122.1/37.4/50/mi')

	// The results list itself is live, DB-backed content - real org listings can legitimately
	// change between runs/environments, which isn't a layout regression. Masked so this test
	// verifies the surrounding chrome/filter-bar/sidebar layout, not specific search results.
	const results = page.getByTestId('search-results-list')
	await expect(results).toBeVisible()

	await expect(page).toHaveScreenshot('search-results.png', { fullPage: true, mask: [results] })
})
