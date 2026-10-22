import { describe, expect, it } from 'vitest'

import { ZGetNatlCrisisSchema } from './query.getNatlCrisis.schema'

/**
 * The search results page passes the country code straight from its URL (`/search/us/...`), which is
 * lowercase. The handler's `cca2` match against the DB is case-sensitive and `Country.cca2` is stored
 * uppercase, so before this was normalized the national crisis lines silently came back empty - on the
 * zero-results page, of all places. Mirrors ZGetIntlCrisisSchema's fix for the same problem (#2067).
 */
describe('ZGetNatlCrisisSchema', () => {
	it('uppercases a lowercase cca2', () => {
		const result = ZGetNatlCrisisSchema.parse({ cca2: 'us' })

		expect(result.cca2).toBe('US')
	})

	it('leaves an already-uppercase cca2 unchanged', () => {
		const result = ZGetNatlCrisisSchema.parse({ cca2: 'US' })

		expect(result.cca2).toBe('US')
	})

	it('still enforces the 2-character length after normalizing', () => {
		const result = ZGetNatlCrisisSchema.safeParse({ cca2: 'usa' })

		expect(result.success).toBe(false)
	})
})
