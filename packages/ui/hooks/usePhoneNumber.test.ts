import { describe, expect, it } from 'vitest'

import { isNanpTollFreeNumber } from './usePhoneNumber'

describe('isNanpTollFreeNumber', () => {
	it('identifies an 800 number as toll-free', () => {
		expect(isNanpTollFreeNumber('+18001231234')).toBe(true)
	})

	it('identifies an 888 number as toll-free', () => {
		expect(isNanpTollFreeNumber('+18881231234')).toBe(true)
	})

	it('does not flag a real US geographic number (Washington DC, 202) as toll-free', () => {
		expect(isNanpTollFreeNumber('+12025550123')).toBe(false)
	})

	it('does not flag a real Canadian geographic number (Ottawa, 613) as toll-free', () => {
		expect(isNanpTollFreeNumber('+16135550123')).toBe(false)
	})

	it('does not flag a non-NANP number as toll-free', () => {
		expect(isNanpTollFreeNumber('+442071838750')).toBe(false)
	})
})
