import { describe, expect, it } from 'vitest'

import { nanoIdUrl } from '~api/schemas/common'
import { schemas as savedListSchemas } from '~api/schemas/savedLists'

import { nanoUrl, nanoUrlRegex, slugSize } from './nanoIdUrl'

/**
 * Runs the real `nanoid` (every other test that touches shared-list slugs mocks `nanoUrl`), so a `nanoid`
 * bump that changes `customAlphabet`'s output can't silently produce share links the app then refuses to
 * open. The contract: whatever `nanoUrl()` generates must pass both schemas that validate a slug coming back
 * in from a shared URL.
 */
describe('nanoUrl (shared saved-list slugs)', () => {
	const samples = Array.from({ length: 500 }, () => nanoUrl())

	it('generates slugs of exactly `slugSize` characters, using only URL-safe alphanumerics', () => {
		for (const slug of samples) {
			expect(slug).toHaveLength(slugSize)
			expect(slug).toMatch(/^[0-9A-Za-z]+$/)
		}
	})

	it('generates slugs that both inbound slug schemas accept', () => {
		for (const slug of samples) {
			expect(slug).toMatch(nanoUrlRegex)
			expect(nanoIdUrl.safeParse(slug).success).toBe(true)
			expect(savedListSchemas.urlSlug.safeParse({ slug }).success).toBe(true)
		}
	})

	it('does not repeat itself across a batch (it is actually random, not a fixed/seeded value)', () => {
		expect(new Set(samples).size).toBe(samples.length)
	})
})
