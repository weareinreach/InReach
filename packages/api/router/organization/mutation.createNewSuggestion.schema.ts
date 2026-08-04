import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

// Not exhaustive of every IANA TLD - just the ones realistically expected for an org located in the
// countries this form currently accepts (US, Mexico, Canada), plus common generic TLDs. Catches typos
// like "aclu.or" (missing the final letter) that `.url()` alone can't detect.
const ALLOWED_TLDS = new Set([
	'com',
	'org',
	'net',
	'edu',
	'gov',
	'mil',
	'info',
	'biz',
	'co',
	'io',
	'app',
	'me',
	'us',
	'mx',
	'ca',
])

const hasValidTld = (url: string) => {
	try {
		const tld = new URL(url).hostname.split('.').pop()?.toLowerCase()
		return Boolean(tld && ALLOWED_TLDS.has(tld))
	} catch {
		return false
	}
}

export const ZCreateNewSuggestionSchema = z.object({
	countryId: prefixedId('country'),
	orgName: z.string().trim().min(2),
	orgSlug: z.string().regex(/^[A-Za-z0-9-]*$/, 'Slug must only contain letters, numbers, and hyphens'),
	orgWebsite: z
		.string()
		.trim()
		.min(1, 'Organization website is required')
		.url('Please enter a valid, complete URL (e.g. https://example.org)')
		.refine(hasValidTld, {
			message:
				"That doesn't look like a valid website address - please double check for typos (e.g. https://example.org)",
		}),
	orgAddress: z
		.object({
			street1: z.string(),
			city: z.string(),
			govDist: z.string(),
			postCode: z.string(),
		})
		.partial()
		.nullish(),
	communityFocus: prefixedId('attribute').array().nullish(),
	serviceCategories: z.string().array().nullish(),
	existingOrgId: prefixedId('organization').optional(),
})
export type TCreateNewSuggestionSchema = z.infer<typeof ZCreateNewSuggestionSchema>
