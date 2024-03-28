import { type Prisma } from '@prisma/client'
import { Ulid } from 'id128'

/**
 * Tables that are not in the idPrefix or excludedTables
 *
 * If the type resolves to `never`, then everything is good. Otherwise, it will resolve to the missing table
 * name(s)
 *
 * This is for utility purposes.
 */
type _TablesNotInIdPrefix = Exclude<
	Prisma.ModelName,
	Capitalize<keyof typeof idPrefix> | (typeof excludedTables)[number]
>

export const idPrefix = {
	account: 'acct',
	attribute: 'attr',
	attributeCategory: 'attc',
	attributeSupplement: 'atts',
	attributeSupplementDataSchema: 'asds',
	country: 'ctry',
	dataMigration: 'data',
	fieldVisibility: 'fviz',
	freeText: 'ftxt',
	geoData: 'geod',
	govDist: 'gdst',
	govDistType: 'gdty',
	internalNote: 'note',
	language: 'lang',
	locationAlert: 'alrt',
	organization: 'orgn',
	orgEmail: 'oeml',
	orgHours: 'ohrs',
	orgLocation: 'oloc',
	orgPhone: 'ophn',
	orgPhoto: 'opto',
	orgReview: 'orev',
	orgService: 'osvc',
	orgSocialMedia: 'osmd',
	orgWebsite: 'oweb',
	outsideAPI: 'oapi',
	permission: 'perm',
	phoneType: 'phtp',
	serviceArea: 'svar',
	serviceCategory: 'svct',
	serviceTag: 'svtg',
	session: 'sess',
	slugRedirect: 'slgr',
	socialMediaLink: 'smdl',
	socialMediaService: 'smsv',
	source: 'srce',
	suggestion: 'sugg',
	translatedReview: 'revt',
	user: 'user',
	userCommunity: 'ucom',
	userEthnicity: 'ueth',
	userImmigration: 'uimm',
	userMail: 'usml',
	userRole: 'urle',
	userSavedList: 'ulst',
	userSOGIdentity: 'usog',
	userSurvey: 'usvy',
	userTitle: 'uttl',
	userType: 'utyp',
} satisfies { [K in Uncapitalize<Tables>]: string }

export type IdPrefix = keyof typeof idPrefix

export const getIdPrefixRegex = (...keys: Uncapitalize<Tables>[]) => {
	const prefixes = keys.map((key) => idPrefix[key])
	const pattern = `^(${prefixes.join('|')})`
	return new RegExp(pattern)
}

export const isIdFor = (table: Uncapitalize<Tables>, id: string) => {
	const regex = getIdPrefixRegex(table)
	const [prefix, suffix] = id.split('_')
	if (!prefix || !suffix) {
		return false
	}
	return regex.test(prefix) && Ulid.isCanonical(suffix)
}

/**
 * It generates a unique id for a given table, prefixed with the table identifier
 *
 * @param {IdPrefix} table - This is the table name that you want to generate an ID for.
 * @param {Date | number} [seedTime] - _Used for migrating data_ - This is the time that you want to use as
 *   the seed for the id. If you don't pass this in, it will use the current time.
 * @returns A table-prefixed ID
 */
export const generateId = (table: IdPrefix, seedTime?: Date | number) => {
	const seedNum =
		typeof seedTime === 'undefined' ? undefined : typeof seedTime === 'number' ? seedTime : seedTime.valueOf()
	const prefix = idPrefix[table]

	const id = Ulid.generate({ time: seedNum }).toCanonical()
	const prefixedId = `${prefix}_${id}`
	return prefixedId
}

type Tables = Exclude<Prisma.ModelName, (typeof excludedTables)[number]>

const excludedTables = [
	'UserPermission',
	'RolePermission',
	'UserToOrganization',
	'OrganizationPermission',
	'LocationPermission',
	'UserCommunityLink',
	'UserSOGLink',
	'ListSharedWith',
	'SavedOrganization',
	'SavedService',
	'AssignedRole',
	'SurveyCommunity',
	'SurveyEthnicity',
	'SurveySOG',
	'OrgWebsiteLanguage',
	'OrgPhoneLanguage',
	'OrgServicePhone',
	'OrgServiceEmail',
	'OrgLocationEmail',
	'OrgLocationPhone',
	'OrgLocationService',
	'OrgServiceTag',
	'ServiceAreaCountry',
	'ServiceAreaDist',
	'AttributeToCategory',
	'ServiceCategoryDefaultAttribute',
	'ServiceTagDefaultAttribute',
	'orgsearchresults',
	'VerificationToken',
	'TranslationNamespace',
	'TranslationKey',
	'OutsideAPIService',
	'OrganizationPhone',
	'OrganizationEmail',
	'AttributeNesting',
	'ServiceTagNesting',
	'ServiceTagCountry',
	'AttributesByCategory',
	'user_refresh_token',
	'user_access_token',
	'AuditTrail',
	'ServiceTagToCategory',
	'OrgLocationSocialMedia',
	'OrgLocationWebsite',
	'OrgServiceWebsite',
] as const // satisfies Prisma.ModelName[]
