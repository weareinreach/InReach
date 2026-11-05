import { describe, expect, it } from 'vitest'

import { safeEqual } from './index'

describe('safeEqual', () => {
	it('returns true for identical strings', () => {
		expect(safeEqual('my-secret', 'my-secret')).toBe(true)
	})

	it('returns false for different strings of the same length', () => {
		expect(safeEqual('my-secret', 'my-secreT')).toBe(false)
	})

	it('returns false (not a throw) for different-length strings', () => {
		expect(safeEqual('short', 'a-lot-longer')).toBe(false)
	})

	it('returns false for an empty vs. non-empty string', () => {
		expect(safeEqual('', 'my-secret')).toBe(false)
	})
})
