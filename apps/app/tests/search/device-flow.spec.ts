import { expect, test } from '@playwright/test'

/**
 * Section 12 of docs/Testing/search-test-inventory.md, cases 12.5/12.6 - a full search flow (search -> filter
 * -> view result -> save) run against real mobile (iPhone 13) and tablet (iPad gen 7) device emulation, via
 * the `mobile`/`tablet` Playwright projects (playwright.config.ts) - neither project existed before this.
 * Only this one file runs under those projects (`testMatch`), so it's the only spec whose viewport
 * assumptions need to hold at those sizes.
 *
 * "Save" isn't asserted end-to-end here: there's no authenticated Playwright fixture yet (tests/crud is still
 * empty for the same reason - see this doc's Data-Portal section), so the only thing to confirm is that
 * tapping Save is reachable and produces the expected unauthenticated prompt, not that a save actually
 * persists.
 */
test('12.5/12.6: search, apply a filter, open a result, and reach the save prompt - no overlapping elements or unreachable taps', async ({
	page,
}) => {
	await page.goto('/search/us/-122.1/37.4/50/mi')

	// The cookie-consent banner overlaps and intercepts taps on this viewport size - dismiss it
	// first, same as a real first-time mobile visitor would need to. Waits for it to actually be
	// gone (not just for the click to register) - it can take a moment to animate away, and a
	// later tap landing while it's still mid-dismissal reproduces the exact "banner intercepts
	// pointer events" failure this is here to avoid.
	const cookieAccept = page.getByRole('button', { name: 'Accept' })
	if (await cookieAccept.isVisible().catch(() => false)) {
		await cookieAccept.click()
		await expect(cookieAccept).not.toBeVisible()
	}

	const serviceFilterButton = page.getByRole('button', { name: 'Filter by services' })
	await expect(serviceFilterButton).toBeVisible()
	await serviceFilterButton.click()

	const firstCategory = page.getByRole('button', { name: /Abortion Care/i })
	await expect(firstCategory).toBeVisible()
	await firstCategory.click()
	const firstServiceCheckbox = page.getByRole('checkbox', { name: 'Abortion providers' })
	await expect(firstServiceCheckbox).toBeVisible()
	await firstServiceCheckbox.click()

	const viewResultsButton = page.getByRole('button', { name: /^View \d+ results?$/ })
	await expect(viewResultsButton).toBeVisible()
	await viewResultsButton.click()

	// Result cards render as a link to the org's detail page - resolved server-side, so this
	// isn't the `/org/[slug]` literal template seen in packages/ui's own component tests (those
	// lack a real Next.js router context; the real running app does resolve it).
	const firstResultLink = page.locator('a[href^="/org/"]').first()
	await expect(firstResultLink).toBeVisible()
	await firstResultLink.click()

	await expect(page).toHaveURL(/\/org\//)

	// ActionButtonGroup (packages/ui/components/core/ActionButtons/Group.tsx) collapses buttons
	// that don't fit the toolbar's width into an overflow menu - every button-width guess is
	// still real (kept mounted with `visibility: hidden`, not `display: none`, so it can be
	// measured), so `data-targetid="save"` alone isn't enough to find the *tappable* one at a
	// narrow width; it may need the overflow menu opened first.
	let saveButton = page.locator('[data-targetid="save"]')
	if (!(await saveButton.isVisible())) {
		// The overflow-menu trigger (Menu.tsx) has no accessible name at all - an icon-only
		// `<Button>` with no `aria-label` - so it has to be targeted by its icon instead of role.
		await page.locator('button:has(iconify-icon[icon="carbon:overflow-menu-horizontal"])').click()
		saveButton = page.locator('[data-targetid="save"]:visible')
	}
	await expect(saveButton).toBeVisible()
	await saveButton.click()

	// Unauthenticated - QuickPromotionModal.tsx prompts to log in or sign up rather than saving.
	await expect(page.getByRole('heading', { name: 'You need to log in to do that.' })).toBeVisible()
})
