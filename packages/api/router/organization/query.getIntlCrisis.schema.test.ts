import { describe, expect, it } from 'vitest'

import { ZGetIntlCrisisSchema } from './query.getIntlCrisis.schema'

/**
 * #2067 - a lowercase or mixed-case country code reaching `getIntlCrisis` doesn't just display wrong
 * (Intl.DisplayNames.of(), handled separately in [country].tsx) - it also silently matches zero
 * organizations, since the handler's `cca2` equality check against the DB is case-sensitive and
 * `Country.cca2` is stored uppercase. Normalizing at the schema boundary means every caller (this page, any
 * future one, a direct API call) gets the fix for free, not just this one page.
 */
describe('ZGetIntlCrisisSchema', () => {
	it('uppercases a lowercase cca2', () => {
		const result = ZGetIntlCrisisSchema.parse({ cca2: 'de' })

		expect(result.cca2).toBe('DE')
	})

	it('leaves an already-uppercase cca2 unchanged', () => {
		const result = ZGetIntlCrisisSchema.parse({ cca2: 'DE' })

		expect(result.cca2).toBe('DE')
	})

	it('still enforces the 2-character length after normalizing', () => {
		const result = ZGetIntlCrisisSchema.safeParse({ cca2: 'deu' })

		expect(result.success).toBe(false)
	})
})
