import { z } from 'zod'

const nonEmptyString = z.string().trim().min(2)

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

export const SuggestionSchema = z.object({
	countryId: nonEmptyString,
	orgName: nonEmptyString,
	orgSlug: nonEmptyString,
	orgWebsite: z
		.string({ error: 'Organization website is required' })
		.trim()
		.min(1, 'Organization website is required')
		.pipe(z.url({ error: 'Please enter a valid, complete URL (e.g. https://example.org)' }))
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
	serviceCategories: z.string().array().nullish(),
	communityFocus: z.string().array().nullish(),
})
