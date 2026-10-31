import { type Prisma } from '@weareinreach/db'

/**
 * Shared select shape for any review list that's shown somewhere a reviewer's own field-visibility
 * preferences apply - everything needed to both render a review and redact the reviewer's name/image/
 * location per `redactReviewFieldVisibility` below. Previously copy-pasted identically between
 * `query.getByIds.handler.ts` and `query.getFeatured.handler.ts`; also what a review list needs regardless of
 * which entity (org/location/service) it's scoped to - `query.getByOrg`/`getByLocation`/`getByService`
 * returned raw `orgReview` rows with no select and no redaction at all, a real exposure of reviewer location
 * data (and of hidden/unmoderated review content, since they had no `visible`/`deleted` filter either).
 */
export const visibleReviewSelect = {
	id: true,
	rating: true,
	reviewText: true,
	user: {
		select: {
			name: true,
			image: true,
			fieldVisibility: {
				select: {
					name: true,
					image: true,
					currentCity: true,
					currentGovDist: true,
					currentCountry: true,
				},
			},
			permissions: {
				where: {
					permission: {
						name: 'isLCR',
					},
				},
			},
		},
	},
	language: {
		select: {
			languageName: true,
			nativeName: true,
		},
	},
	langConfidence: true,
	translatedText: {
		select: {
			text: true,
			language: {
				select: { localeCode: true },
			},
		},
	},
	lcrCity: true,
	lcrGovDist: {
		select: {
			tsKey: true,
			tsNs: true,
		},
	},
	lcrCountry: {
		select: {
			tsNs: true,
			tsKey: true,
		},
	},
	createdAt: true,
} satisfies Prisma.OrgReviewSelect

type VisibleReviewResult = Prisma.OrgReviewGetPayload<{ select: typeof visibleReviewSelect }>

/**
 * Nulls out whichever of the reviewer's name/image/city/district/country they've chosen to hide, per their
 * own `fieldVisibility` preference - a reviewer with no `fieldVisibility` row at all is treated as hiding
 * everything (the safer default) rather than showing everything.
 */
export const redactReviewFieldVisibility = (result: VisibleReviewResult) => {
	const {
		name: nameVisible,
		image: imageVisible,
		currentCity: cityVisible,
		currentGovDist: distVisible,
		currentCountry: countryVisible,
	} = result.user.fieldVisibility ?? {
		name: false,
		image: false,
		currentCity: false,
		currentGovDist: false,
		currentCountry: false,
	}

	return {
		...result,
		user: {
			image: imageVisible ? result.user.image : null,
			name: nameVisible ? result.user.name : null,
		},
		lcrCity: cityVisible ? result.lcrCity : null,
		lcrGovDist: distVisible ? result.lcrGovDist : null,
		lcrCountry: countryVisible ? result.lcrCountry : null,
		verifiedUser: Boolean(result.user.permissions.length),
	}
}
