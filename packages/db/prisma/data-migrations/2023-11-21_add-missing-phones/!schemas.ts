import { string, z } from 'zod'

const stripEmptyString = (val?: string) => (typeof val === 'string' && val === '' ? undefined : val)
const boolOrBlank = z
	.enum(['FALSE', 'TRUE', ''])
	.transform((val) => (val === 'TRUE' ? true : val === 'FALSE' ? false : undefined))

const stringToArray = (val?: string) =>
	(typeof val === 'string' && val === '') || val === undefined
		? undefined
		: val.split(',').map((x) => x.trim())

const separateServiceTags = (val?: string) => {
	const arr = stringToArray(val)
	if (!arr) return undefined
	const output: { category: string; tag: string }[] = []
	for (const item of arr) {
		const [category, tag] = item.split(':')
		if (typeof category === 'string' && typeof tag === 'string') {
			output.push({ category, tag })
		}
	}
	return output
}
const coerceNumber = (val?: string) => {
	const stripped = stripEmptyString(val)
	if (stripped) {
		return parseInt(stripped)
	}
	return undefined
}
export const DataSchema = {
	Organization: z.object({
		id: z.string(),
		Name: z.string(),
		URL: z.string().optional().transform(stripEmptyString),
		Description: z.string(),
		'Alert Message': z.string().optional().transform(stripEmptyString),
		'bipoc-led': boolOrBlank,
		'black-led': boolOrBlank,
		'bipoc-comm': boolOrBlank,
		'immigrant-led': boolOrBlank,
		'immigrant-comm': boolOrBlank,
		'asylum-seekers': boolOrBlank,
		'resettled-refugees': boolOrBlank,
		'trans-led': boolOrBlank,
		'trans-comm': boolOrBlank,
		'trans-youth-focus': boolOrBlank,
		'trans-masc': boolOrBlank,
		'trans-fem': boolOrBlank,
		'gender-nc': boolOrBlank,
		'lgbtq-youth-focus': boolOrBlank,
		'spanish-speakers': boolOrBlank,
		'hiv-comm': boolOrBlank,
		'Additional Notes': z.string().optional().transform(stripEmptyString),
		'reviewed?': boolOrBlank,
	}),

	OrgEmail: z.object({
		id: z.string(),
		firstName: z.string().optional().transform(stripEmptyString),
		lastName: z.string().optional().transform(stripEmptyString),
		primary: boolOrBlank,
		email: z.string().email(),
		description: z.string().optional().transform(stripEmptyString),
		organizationId: z.string(),
		locationOnly: boolOrBlank,
		serviceOnly: boolOrBlank,
	}),

	SvcAccess: z.object({
		id: z.string(),
		serviceId: z.string(),
		type: z.enum(['email', 'phone', 'file', 'link', '']),
		value: z.string(),
	}),
	OrgPhone: z.object({
		id: z.string(),
		number: z.string(),
		ext: z.string().optional().transform(stripEmptyString),
		primary: boolOrBlank,
		countryId: z.string().optional().transform(stripEmptyString),
		description: z.string(),
		organizationId: z.string(),
	}),
	OrgLocation: z.object({
		id: z.string(),
		organizationId: z.string(),
		'Location Name': z.string(),
		Country: z.string(),
		Street: z.string().optional().transform(stripEmptyString),
		City: z.string().optional().transform(stripEmptyString),
		State: z.string().optional().transform(stripEmptyString),
		PostalCode: z.string().optional().transform(stripEmptyString),
		'Hide Location?': boolOrBlank,
		'Service Area Coverage - USA National': z
			.string()
			.optional()
			.transform((val) => stringToArray(val)),
		'Service Area Coverage - State(s)': z
			.string()
			.optional()
			.transform((val) => stringToArray(val)),
	}),
	OrgSocial: z.object({
		id: z.string(),
		organizationId: z.string(),
		service: z.string(),
		url: z.string().url(),
	}),
	OrgService: z.object({
		id: z.string(),
		organizationId: z.string(),
		Title: z.string(),
		Description: z.string(),
		'Tag(s)': z.string().optional().transform(separateServiceTags),
		'other-describe': z.string().optional().transform(stripEmptyString),
		'elig-age-min': z.string().optional().transform(coerceNumber),
		'elig-age-max': z.string().optional().transform(coerceNumber),
		'cost-free': boolOrBlank,
		'cost-fees': z.string().optional().transform(coerceNumber),
		'lang-offered': z.string().optional().transform(stringToArray),
		'has-confidentiality-policy': boolOrBlank,
		'offers-remote-services': boolOrBlank,
		'req-medical-insurance': boolOrBlank,
		'req-photo-id': boolOrBlank,
		'req-proof-of-age': boolOrBlank,
		'req-proof-of-income': boolOrBlank,
		'req-referral': boolOrBlank,
		'at-capacity': boolOrBlank,
	}),
}
export const DataFile = z.object({
	organization: DataSchema.Organization.array(),
	orgEmail: DataSchema.OrgEmail.array(),
	svcAccess: DataSchema.SvcAccess.array(),
	orgPhone: DataSchema.OrgPhone.array(),
	orgLocation: DataSchema.OrgLocation.array(),
	orgSocial: DataSchema.OrgSocial.array(),
	orgService: DataSchema.OrgService.array(),
})

export const JoinSchema = {
	OrgServicePhone: z.object({
		serviceId: z.string(),
		phoneId: z.string(),
	}),
	OrgServiceEmail: z.object({
		serviceId: z.string(),
		emailId: z.string(),
	}),
	OrgLocationEmail: z.object({
		locationId: z.string(),
		emailId: z.string(),
	}),
	OrgLocationService: z.object({
		locationId: z.string(),
		serviceId: z.string(),
	}),
	OrgLocationPhone: z.object({
		locationId: z.string(),
		phoneId: z.string(),
	}),
}
export const JoinFile = z.object({
	orgServicePhone: JoinSchema.OrgServicePhone.array(),
	orgServiceEmail: JoinSchema.OrgServiceEmail.array(),
	orgLocationEmail: JoinSchema.OrgLocationEmail.array(),
	orgLocationService: JoinSchema.OrgLocationService.array(),
	orgLocationPhone: JoinSchema.OrgLocationPhone.array(),
})
