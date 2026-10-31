import { describe, expect, it } from 'vitest'

import { redactReviewFieldVisibility, visibleReviewSelect } from './reviewSelect'

const baseResultValue = {
	id: 'orvw_test',
	rating: 5,
	reviewText: 'Great place',
	user: {
		name: 'Jane Doe',
		image: 'https://example.org/jane.png',
		fieldVisibility: {
			name: true,
			image: false,
			currentCity: true,
			currentGovDist: false,
			currentCountry: true,
		},
		permissions: [] as { permission: { name: string } }[],
	},
	language: null,
	langConfidence: null,
	translatedText: [],
	lcrCity: 'Springfield',
	lcrGovDist: { tsKey: 'gov.il', tsNs: 'gov-dist' },
	lcrCountry: { tsNs: 'country', tsKey: 'country.us' },
	createdAt: new Date('2026-01-01'),
}
const baseResult = baseResultValue as never

describe('redactReviewFieldVisibility', () => {
	it('only includes fields the reviewer chose to make visible', () => {
		const result = redactReviewFieldVisibility(baseResult)

		expect(result.user.name).toBe('Jane Doe')
		expect(result.user.image).toBeNull()
		expect(result.lcrCity).toBe('Springfield')
		expect(result.lcrGovDist).toBeNull()
		expect(result.lcrCountry).not.toBeNull()
	})

	it('hides everything when the reviewer has no fieldVisibility row at all', () => {
		const noPrefsValue = { ...baseResultValue, user: { ...baseResultValue.user, fieldVisibility: null } }
		const result = redactReviewFieldVisibility(noPrefsValue as never)

		expect(result.user.name).toBeNull()
		expect(result.user.image).toBeNull()
		expect(result.lcrCity).toBeNull()
		expect(result.lcrGovDist).toBeNull()
		expect(result.lcrCountry).toBeNull()
	})

	it('marks a review as verified only when the reviewer has the isLCR permission', () => {
		const withPermissionValue = {
			...baseResultValue,
			user: { ...baseResultValue.user, permissions: [{ permission: { name: 'isLCR' } }] },
		}

		expect(redactReviewFieldVisibility(baseResult).verifiedUser).toBe(false)
		expect(redactReviewFieldVisibility(withPermissionValue as never).verifiedUser).toBe(true)
	})
})

describe('visibleReviewSelect', () => {
	it('selects the reviewer location/fieldVisibility fields every redaction depends on', () => {
		expect(visibleReviewSelect.lcrCity).toBe(true)
		expect(visibleReviewSelect.user.select.fieldVisibility.select).toMatchObject({
			name: true,
			image: true,
			currentCity: true,
			currentGovDist: true,
			currentCountry: true,
		})
	})
})
