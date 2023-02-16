import { Prisma } from '@prisma/client'
import { ulid } from 'ulid'

export const idPrefix = {
	account: 'acct',
	attribute: 'attr',
	attributeCategory: 'attc',
	attributeSupplement: 'atts',
	auditLog: 'audt',
	country: 'ctry',
	fieldVisibility: 'fviz',
	footerLink: 'ftrl',
	freeText: 'ftxt',
	govDist: 'gdst',
	govDistType: 'gdty',
	internalNote: 'note',
	language: 'lang',
	navigation: 'navl',
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
	serviceAccess: 'svac',
	serviceArea: 'svar',
	serviceCategory: 'svct',
	serviceTag: 'svtg',
	session: 'sess',
	socialMediaLink: 'smdl',
	socialMediaService: 'smsv',
	source: 'srce',
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

type IdPrefix = keyof typeof idPrefix

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

	const id = ulid(seedNum)
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
	'OrganizationAttribute',
	'LocationAttribute',
	'ServiceAttribute',
	'ServiceAccessAttribute',
	'AttributeToCategory',
	'ServiceCategoryDefaultAttribute',
	'ServiceTagDefaultAttribute',
	'orgsearchresults',
	'attributeandcategory',
	'servicetagcategory',
	'VerificationToken',
	'TranslationNamespace',
	'TranslationKey',
	'OutsideAPIService',
] as const // satisfies Prisma.ModelName[]
