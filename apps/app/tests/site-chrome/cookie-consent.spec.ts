import { expect, type Page, test } from '@playwright/test'

/**
 * Section 2 of docs/Testing/site-chrome-test-inventory.md - the analytics/cookie consent banner
 * (`react-hook-consent`, wired in apps/app/src/providers/index.tsx), against the real running app. Persisted
 * to `localStorage['react-hook-consent']` as `{"consent": string[], "hash": string, "updated": string}` -
 * confirmed directly, not assumed from the library's docs.
 */

const antiHateDialog = (page: Page) =>
	page.locator('[role="dialog"]').filter({ hasText: 'Anti-hate commitment' })

const dismissAntiHate = async (page: Page) => {
	const dialog = antiHateDialog(page)
	await dialog.getByRole('button', { name: 'Accept' }).click()
	await expect(dialog).not.toBeVisible()
}

type StoredConsent = { consent: string[]; hash: string; updated: string }

const getConsent = (page: Page): Promise<StoredConsent | null> =>
	page.evaluate(() => {
		const raw = localStorage.getItem('react-hook-consent')
		return raw ? (JSON.parse(raw) as StoredConsent) : null
	})

test.beforeEach(async ({ context }) => {
	await context.clearCookies()
})

test('2.1: no stored consent - banner shows (bottom, non-blocking)', async ({ page }) => {
	await page.goto('/')
	await dismissAntiHate(page)

	const banner = page.getByText('We use necessary cookies to make our site work')
	await expect(banner).toBeVisible()
	// Non-blocking: the rest of the page stays interactive underneath it (unlike the anti-hate
	// modal, which sets aria-hidden on everything else while open).
	await expect(page.getByRole('link', { name: 'InReach logo' }).first()).toBeVisible()
})

test('2.2: clicking Approve grants all services and persists them; banner closes', async ({ page }) => {
	await page.goto('/')
	await dismissAntiHate(page)

	await page.getByRole('button', { name: 'Accept', exact: true }).click()

	await expect(page.getByText('We use necessary cookies to make our site work')).not.toBeVisible()
	const consent = await getConsent(page)
	expect(consent?.consent?.sort()).toEqual(['basic', 'ga4'])
})

test('2.3: clicking Decline records empty (non-mandatory) consent; banner closes', async ({ page }) => {
	await page.goto('/')
	await dismissAntiHate(page)

	await page.getByRole('button', { name: 'Decline', exact: true }).click()

	await expect(page.getByText('We use necessary cookies to make our site work')).not.toBeVisible()
	const consent = await getConsent(page)
	// Corrects a wrong assumption, found while writing this test: 'basic' being `mandatory: true`
	// (providers/index.tsx) only means its checkbox can't be unchecked in the settings modal UI -
	// confirmed directly that Decline still clears the stored consent array to genuinely empty,
	// not `['basic']`.
	expect(consent?.consent).toEqual([])
})

test('2.4: valid stored consent matching the current config - banner does not reshow on reload', async ({
	page,
}) => {
	await page.goto('/')
	await dismissAntiHate(page)
	await page.getByRole('button', { name: 'Accept', exact: true }).click()
	await expect(page.getByText('We use necessary cookies to make our site work')).not.toBeVisible()

	await page.reload()

	await expect(page.getByText('We use necessary cookies to make our site work')).not.toBeVisible()
})

test('2.5: stored consent with a hash mismatch - banner reshows despite a prior choice', async ({ page }) => {
	await page.goto('/')
	await page.evaluate(() => {
		localStorage.setItem(
			'react-hook-consent',
			JSON.stringify({
				consent: ['basic', 'ga4'],
				hash: 'stale-hash-does-not-match',
				updated: new Date().toISOString(),
			})
		)
	})
	await page.reload()
	await dismissAntiHate(page)

	await expect(page.getByText('We use necessary cookies to make our site work')).toBeVisible()
})

test('2.6: clicking Customize opens the settings modal (ga4 toggle, unchecked) without recording any choice yet', async ({
	page,
}) => {
	await page.goto('/')
	await dismissAntiHate(page)

	await page.getByRole('button', { name: 'Customize' }).click()

	await expect(page.getByText('Cookies Settings')).toBeVisible()
	const ga4Toggle = page.locator('#ga4')
	await expect(ga4Toggle).not.toBeChecked()
	const consent = await getConsent(page)
	expect(consent).toBeNull()
})

test("2.7: the settings modal's Privacy Statement link opens PrivacyStatementModal in-app", async ({
	page,
}) => {
	await page.goto('/')
	await dismissAntiHate(page)
	await page.getByRole('button', { name: 'Customize' }).click()

	// Not `getByRole('link', ...)`: this anchor has no `href` (it's a modal launcher, not real
	// navigation), so per ARIA semantics it has no implicit link role - confirmed directly, not a
	// bug in the component. Scoped to `[data-testid="settings"]` (react-hook-consent's own
	// settings panel): the footer's separate, lowercase "Privacy statement" link is also present
	// and covered by the modal, so an unscoped text match can hit that one instead.
	await page.locator('[data-testid="settings"]').getByText('Privacy Statement').click()

	await expect(page.getByRole('heading', { name: 'Privacy Statement' })).toBeVisible()
	await expect(page).toHaveURL('/')
})

test('2.8: toggling the ga4 switch alone does not persist anything - only Approve selected/Approve all/Decline do', async ({
	page,
}) => {
	// Corrects a wrong premise in the inventory doc, found while writing this test: the doc
	// suspected the checkbox toggle writes to localStorage directly, bypassing Approve/Decline.
	// It doesn't - confirmed directly that toggling alone leaves localStorage untouched (still
	// `null`), and only clicking one of the modal's own save buttons persists anything, correctly
	// reflecting whatever the toggle was left at.
	await page.goto('/')
	await dismissAntiHate(page)
	await page.getByRole('button', { name: 'Customize' }).click()

	await page.locator('.react-toggle:has(#ga4)').click()
	await expect(page.locator('#ga4')).toBeChecked()
	expect(await getConsent(page)).toBeNull()

	await page.getByRole('button', { name: 'Approve selected' }).click()
	const consent = await getConsent(page)
	expect(consent?.consent?.sort()).toEqual(['basic', 'ga4'])
})

test('2.9: with NEXT_PUBLIC_GA_MEASUREMENT_ID unset, no GA script is injected, independent of consent', async ({
	page,
}) => {
	await page.goto('/')
	await dismissAntiHate(page)
	await page.getByRole('button', { name: 'Accept', exact: true }).click()

	const gaScripts = await page.locator('script[src*="googletagmanager"], script[src*="gtag"]').count()
	expect(gaScripts).toBe(0)
})

test('2.10: on a fresh visit, the anti-hate modal and the consent banner can both be visible without overlapping', async ({
	page,
}) => {
	await page.goto('/')

	const dialog = antiHateDialog(page)
	const banner = page.getByText('We use necessary cookies to make our site work')
	await expect(dialog).toBeVisible()
	await expect(banner).toBeVisible()

	const dialogBox = await dialog.boundingBox()
	const bannerBox = await banner.boundingBox()
	expect(dialogBox).toBeTruthy()
	expect(bannerBox).toBeTruthy()
	if (dialogBox && bannerBox) {
		const overlapsVertically =
			dialogBox.y < bannerBox.y + bannerBox.height && bannerBox.y < dialogBox.y + dialogBox.height
		const overlapsHorizontally =
			dialogBox.x < bannerBox.x + bannerBox.width && bannerBox.x < dialogBox.x + dialogBox.width
		expect(overlapsVertically && overlapsHorizontally).toBe(false)
	}
})

test("2.10b: on a mobile viewport, the consent banner does not overlap the anti-hate modal's Accept button", async ({
	page,
}) => {
	// Correctly fails: confirms a real bug, distinct from 2.10 (which passes - no overlap at a
	// desktop width). At a mobile viewport, the anti-hate modal renders as a fixed-height
	// (`AntiHateMessage.module.css`: 340px) sheet vertically centered in the available space, and
	// the consent banner (also fixed near the bottom) can end up overlapping its Accept button
	// specifically - confirmed directly via bounding boxes at 400px width: the banner's box starts
	// (y=560) before the Accept button's box ends (y=604), covering most of its height. This isn't
	// just a visual nit - it can make the button genuinely hard or impossible to tap on a real
	// phone, and is exactly what made `.click()` (without `force: true`) on this button flaky in
	// other tests at this viewport size. Filed as
	// https://github.com/weareinreach/InReach/issues/2068.
	await page.setViewportSize({ width: 400, height: 900 })
	await page.goto('/')

	const acceptButton = antiHateDialog(page).getByRole('button', { name: 'Accept' })
	const banner = page.locator('.rhc-banner')
	await expect(acceptButton).toBeVisible()
	await expect(banner).toBeVisible()

	const acceptBox = await acceptButton.boundingBox()
	const bannerBox = await banner.boundingBox()
	expect(acceptBox).toBeTruthy()
	expect(bannerBox).toBeTruthy()
	if (acceptBox && bannerBox) {
		const overlapsVertically =
			acceptBox.y < bannerBox.y + bannerBox.height && bannerBox.y < acceptBox.y + acceptBox.height
		const overlapsHorizontally =
			acceptBox.x < bannerBox.x + bannerBox.width && bannerBox.x < acceptBox.x + acceptBox.width
		expect(overlapsVertically && overlapsHorizontally).toBe(false)
	}
})
