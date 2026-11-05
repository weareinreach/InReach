import { expect, test } from '@playwright/test'

/**
 * Security headers added to every response via `apps/app/next.config.mjs`'s `headers()` - previously missing
 * entirely, so nothing stopped another site from framing this app (clickjacking) or controlled what referrer
 * data left it.
 */

test('every page response includes the baseline security headers', async ({ page }) => {
	const response = await page.goto('/')
	expect(response).not.toBeNull()
	const headers = response?.headers() ?? {}

	expect(headers['x-frame-options']).toBe('DENY')
	expect(headers['content-security-policy']).toBe("frame-ancestors 'none'")
	expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
	expect(headers['x-content-type-options']).toBe('nosniff')
	expect(headers['permissions-policy']).toBe('camera=(), microphone=(), geolocation=(), payment=(), usb=()')
})
