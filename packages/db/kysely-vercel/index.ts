import { type ColumnType } from 'kysely'

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
	? ColumnType<S, I | undefined, U>
	: ColumnType<T, T | undefined, T>
export type Timestamp = ColumnType<Date, Date | string, Date | string>
export type AttributeRender = 'COMMUNITY' | 'SERVICE' | 'LEADER' | 'ATTRIBUTE' | 'LIST'
export const AttributeRender = {
	COMMUNITY: 'COMMUNITY',
	SERVICE: 'SERVICE',
	LEADER: 'LEADER',
	ATTRIBUTE: 'ATTRIBUTE',
	LIST: 'LIST',
}
export type FilterType = 'INCLUDE' | 'EXCLUDE'
export const FilterType = {
	INCLUDE: 'INCLUDE',
	EXCLUDE: 'EXCLUDE',
}
export type SourceType = 'EXTERNAL' | 'ORGANIZATION' | 'SYSTEM' | 'USER'
export const SourceType = {
	EXTERNAL: 'EXTERNAL',
	ORGANIZATION: 'ORGANIZATION',
	SYSTEM: 'SYSTEM',
	USER: 'USER',
}
export type InterpolationOptions = 'PLURAL' | 'ORDINAL' | 'CONTEXT'
export const InterpolationOptions = {
	PLURAL: 'PLURAL',
	ORDINAL: 'ORDINAL',
	CONTEXT: 'CONTEXT',
}
export type VisibilitySetting = 'NONE' | 'LOGGED_IN' | 'PROVIDER' | 'PUBLIC'
export const VisibilitySetting = {
	NONE: 'NONE',
	LOGGED_IN: 'LOGGED_IN',
	PROVIDER: 'PROVIDER',
	PUBLIC: 'PUBLIC',
}
export type AuditLogOperation = 'CREATE' | 'UPDATE' | 'DELETE' | 'LINK' | 'UNLINK'
export const AuditLogOperation = {
	CREATE: 'CREATE',
	UPDATE: 'UPDATE',
	DELETE: 'DELETE',
	LINK: 'LINK',
	UNLINK: 'UNLINK',
}
export type Account = {
	id: string
	type: string
	provider: string
	providerAccountId: string
	refresh_token: string | null
	access_token: string | null
	expires_at: number | null
	token_type: string | null
	scope: string | null
	id_token: string | null
	session_state: string | null
	userId: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type AssignedRole = {
	userId: string
	roleId: string
	linkedAt: Generated<Timestamp>
}
export type Attribute = {
	id: string
	tag: string
	name: string
	icon: string | null
	iconBg: string | null
	/** Internal description */
	intDesc: string | null
	active: Generated<boolean>
	/** Can this be used as a filter? No - `null` : Yes - Defined as INCLUDE or EXCLUDE */
	filterType: FilterType | null
	/** Set this flag to have attribute display on Location/Visit cards */
	showOnLocation: boolean | null
	tsKey: string
	tsNs: string
	requireText: Generated<boolean>
	requireLanguage: Generated<boolean>
	requireGeo: Generated<boolean>
	requireBoolean: Generated<boolean>
	requireData: Generated<boolean>
	requiredSchemaId: string | null
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type AttributeCategory = {
	id: string
	tag: string
	name: string
	icon: string | null
	/** Internal description */
	intDesc: string | null
	active: Generated<boolean>
	renderVariant: AttributeRender | null
	ns: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type AttributeNesting = {
	childId: string
	parentId: string
	linkedAt: Generated<Timestamp>
}
export type AttributesByCategory = {
	categoryId: string
	categoryName: string
	categoryDisplay: string
	attributeId: string
	attributeName: string
	attributeKey: string
	attributeNs: string
	interpolationValues: unknown | null
	icon: string | null
	iconBg: string | null
	badgeRender: AttributeRender | null
	requireText: boolean
	requireLanguage: boolean
	requireGeo: boolean
	requireBoolean: boolean
	requireData: boolean
	dataSchemaName: string | null
	dataSchema: unknown | null
}
export type AttributeSupplement = {
	id: string
	active: Generated<boolean>
	data: unknown | null
	boolean: boolean | null
	countryId: string | null
	govDistId: string | null
	languageId: string | null
	textId: string | null
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
	locationAttributeAttributeId: string | null
	locationAttributeLocationId: string | null
	organizationAttributeAttributeId: string | null
	organizationAttributeOrganizationId: string | null
	serviceAccessAttributeAttributeId: string | null
	serviceAccessAttributeServiceAccessId: string | null
	serviceAttributeAttributeId: string | null
	serviceAttributeOrgServiceId: string | null
	userAttributeAttributeId: string | null
	userAttributeUserId: string | null
}
export type AttributeSupplementDataSchema = {
	id: string
	tag: string
	name: string
	definition: unknown
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type AttributeToCategory = {
	attributeId: string
	categoryId: string
	linkedAt: Generated<Timestamp>
}
export type AuditLog = {
	id: string
	actorId: string
	timestamp: Generated<Timestamp>
	from: unknown | null
	to: unknown
	operation: AuditLogOperation
	accountId: string | null
	attributeId: string | null
	attributeCategoryId: string | null
	attributeSupplementId: string | null
	attributeSupplementDataSchemaId: string | null
	countryId: string | null
	fieldVisibilityId: string | null
	freeTextId: string | null
	govDistId: string | null
	govDistTypeId: string | null
	internalNoteId: string | null
	languageId: string | null
	locationPermissionUserId: string | null
	locationPermissionPermissionId: string | null
	locationPermissionOrgLocationId: string | null
	organizationId: string | null
	organizationPermissionUserId: string | null
	organizationPermissionPermissionId: string | null
	organizationPermissionOrganizationId: string | null
	orgEmailId: string | null
	orgHoursId: string | null
	orgLocationId: string | null
	orgPhoneId: string | null
	orgPhotoId: string | null
	orgReviewId: string | null
	orgServiceId: string | null
	orgSocialMediaId: string | null
	orgWebsiteId: string | null
	outsideAPIId: string | null
	outsideAPIServiceService: string | null
	permissionId: string | null
	phoneTypeId: string | null
	serviceAccessId: string | null
	serviceAreaId: string | null
	serviceCategoryId: string | null
	serviceTagId: string | null
	socialMediaLinkId: string | null
	socialMediaServiceId: string | null
	sourceId: string | null
	suggestionId: string | null
	translatedReviewId: string | null
	translationKey: string | null
	translationNs: string | null
	translationNamespaceName: string | null
	userId: string | null
	userCommunityId: string | null
	userEthnicityId: string | null
	userImmigrationId: string | null
	userMailId: string | null
	userRoleId: string | null
	userSavedListId: string | null
	userSOGIdentityId: string | null
	userTitleId: string | null
	userTypeId: string | null
}
export type Country = {
	id: string
	/** ISO 3166-1 alpha-2 Country code */
	cca2: string
	/** ISO 3166-1 alpha-3 Country code */
	cca3: string
	/** Country name (English). */
	name: string
	/** International dialing code */
	dialCode: number | null
	/** Country flag (emoji) */
	flag: string
	/** @zod.custom.use(Geometry) */
	geoJSON: unknown | null
	geoWKT: string | null
	tsKey: string
	tsNs: string
	demonymKey: string | null
	demonymNs: string | null
	activeForOrgs: boolean | null
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type DataMigration = {
	id: string
	jobId: string
	title: string
	description: string | null
	createdBy: string
	appliedAt: Generated<Timestamp>
}
export type FieldVisibility = {
	id: string
	userId: string
	/** All users */
	name: Generated<VisibilitySetting>
	/** For service provider/professional */
	email: Generated<VisibilitySetting>
	/** All users */
	image: Generated<VisibilitySetting>
	/** For LCR accounts */
	ethnicity: Generated<VisibilitySetting>
	/** For LCR accounts */
	countryOrigin: Generated<VisibilitySetting>
	/** For LCR accounts */
	SOG: Generated<VisibilitySetting>
	/** For LCR accounts */
	communities: Generated<VisibilitySetting>
	/** For LCR accounts */
	currentCity: Generated<VisibilitySetting>
	/** For LCR accounts */
	currentGovDist: Generated<VisibilitySetting>
	/** For LCR accounts */
	currentCountry: Generated<VisibilitySetting>
	/** For specialized accounts */
	userType: Generated<VisibilitySetting>
	/** For service provider */
	associatedOrg: Generated<VisibilitySetting>
	/** For service provider */
	orgTitle: Generated<VisibilitySetting>
	/** To facilitate "User since..." */
	createdAt: Generated<VisibilitySetting>
	recordCreatedAt: Generated<Timestamp>
	recordupdatedAt: Timestamp
}
export type FreeText = {
	id: string
	key: string
	ns: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type geography_columns = {
	coord_dimension: number | null
	srid: number | null
	type: string | null
}
export type geometry_columns = {
	f_table_catalog: string | null
	coord_dimension: number | null
	srid: number | null
	type: string | null
}
export type GovDist = {
	id: string
	/** Name (English/Roman alphabet) */
	name: string
	/** Slug - [country (ISO)]-[govdist]-[...] */
	slug: string
	/** ISO-3166-2 code */
	iso: string | null
	/** Abbreviation (Optional) */
	abbrev: string | null
	/** @zod.custom.use(Geometry) */
	geoJSON: unknown | null
	geoWKT: string | null
	active: Generated<boolean | null>
	countryId: string
	govDistTypeId: string
	/** Table can be used for "sub districts" (State -> County -> City) */
	isPrimary: Generated<boolean | null>
	parentId: string | null
	tsKey: string
	tsNs: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type GovDistType = {
	id: string
	name: string
	tsKey: string
	tsNs: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type InternalNote = {
	id: string
	/** Old ID from MongoDB */
	legacyId: string | null
	text: string
	attributeId: string | null
	attributeCategoryId: string | null
	attributeSupplementId: string | null
	attributeSupplementDataSchemaId: string | null
	countryId: string | null
	govDistId: string | null
	govDistTypeId: string | null
	languageId: string | null
	organizationId: string | null
	orgEmailId: string | null
	orgHoursId: string | null
	orgLocationId: string | null
	orgPhoneId: string | null
	orgPhotoId: string | null
	orgReviewId: string | null
	orgServiceId: string | null
	orgSocialMediaId: string | null
	orgWebsiteId: string | null
	outsideApiId: string | null
	outsideAPIServiceService: string | null
	permissionId: string | null
	phoneTypeId: string | null
	serviceAccessId: string | null
	serviceCategoryId: string | null
	serviceTagId: string | null
	socialMediaLinkId: string | null
	socialMediaServiceId: string | null
	sourceId: string | null
	suggestionId: string | null
	translationKey: string | null
	translationNs: string | null
	translationNamespaceName: string | null
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type Language = {
	id: string
	languageName: string
	/** ETF BCP 47 language tag */
	localeCode: string
	/** ISO 639-2 */
	iso6392: string | null
	/** Language name in it's language. */
	nativeName: string
	/** Is this language being actively used for translations? */
	activelyTranslated: Generated<boolean>
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type ListSharedWith = {
	userId: string
	listId: string
	linkedAt: Generated<Timestamp>
}
export type LocationAttribute = {
	locationId: string
	attributeId: string
	linkedAt: Generated<Timestamp>
}
export type LocationPermission = {
	userId: string
	permissionId: string
	authorized: Generated<boolean>
	orgLocationId: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type Organization = {
	id: string
	/** Old ID from MongoDB */
	legacyId: string | null
	name: string
	/** @zod.string.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/gm) */
	slug: string
	legacySlug: string | null
	descriptionId: string | null
	deleted: Generated<boolean>
	published: Generated<boolean>
	lastVerified: Timestamp | null
	sourceId: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
	/** Does this record need to be checked by staff after migration? */
	checkMigration: boolean | null
}
export type OrganizationAttribute = {
	organizationId: string
	attributeId: string
	linkedAt: Generated<Timestamp>
}
export type OrganizationEmail = {
	orgEmailId: string
	organizationId: string
	linkedAt: Generated<Timestamp>
}
export type OrganizationPermission = {
	userId: string
	permissionId: string
	authorized: Generated<boolean>
	organizationId: string
	linkedAt: Generated<Timestamp>
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type OrganizationPhone = {
	organizationId: string
	phoneId: string
	linkedAt: Generated<Timestamp>
}
export type OrgEmail = {
	id: string
	/** Old ID from MongoDB */
	legacyId: string | null
	legacyDesc: string | null
	firstName: string | null
	lastName: string | null
	primary: Generated<boolean>
	email: string
	published: Generated<boolean>
	deleted: Generated<boolean>
	titleId: string | null
	descriptionId: string | null
	/** Associated only with location/service and not overall organization (for large orgs w/ multiple locations) */
	locationOnly: Generated<boolean>
	serviceOnly: Generated<boolean>
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type OrgHours = {
	id: string
	/** Sun 0, Mon 1, Tue 2, Wed 3, Thu 3, Fri 4, Sat 6 */
	dayIndex: Generated<number>
	start: Timestamp
	end: Timestamp
	closed: Generated<boolean>
	tz: string | null
	orgLocId: string | null
	orgServiceId: string | null
	organizationId: string | null
	needAssignment: Generated<boolean>
	needReview: Generated<boolean>
	legacyId: string | null
	legacyName: string | null
	legacyNote: string | null
	legacyStart: string | null
	legacyEnd: string | null
	legacyTz: string | null
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type OrgLocation = {
	id: string
	/** Old ID from MongoDB */
	legacyId: string | null
	name: string | null
	street1: string
	street2: string | null
	city: string
	postCode: string | null
	primary: Generated<boolean>
	mailOnly: boolean | null
	descriptionId: string | null
	govDistId: string | null
	countryId: string
	longitude: number | null
	latitude: number | null
	/** @zod.custom.use(Geometry) */
	geoJSON: unknown
	geoWKT: string | null
	published: Generated<boolean>
	deleted: Generated<boolean>
	orgId: string
	apiLocationId: string | null
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
	/** Does this record need to be checked by staff after migration? */
	checkMigration: boolean | null
}
export type OrgLocationEmail = {
	orgLocationId: string
	orgEmailId: string
	linkedAt: Generated<Timestamp>
}
export type OrgLocationPhone = {
	orgLocationId: string
	phoneId: string
	linkedAt: Generated<Timestamp>
}
export type OrgLocationService = {
	orgLocationId: string
	serviceId: string
	linkedAt: Generated<Timestamp>
}
export type OrgPhone = {
	id: string
	/** Old ID from MongoDB */
	legacyId: string | null
	legacyDesc: string | null
	number: string
	ext: string | null
	primary: Generated<boolean>
	published: Generated<boolean>
	deleted: Generated<boolean>
	migrationReview: boolean | null
	countryId: string
	phoneTypeId: string | null
	descriptionId: string | null
	locationOnly: Generated<boolean>
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type OrgPhoneLanguage = {
	orgPhoneId: string
	languageId: string
	linkedAt: Generated<Timestamp>
}
export type OrgPhoto = {
	id: string
	src: string
	height: number | null
	width: number | null
	published: Generated<boolean>
	deleted: Generated<boolean>
	orgId: string | null
	orgLocationId: string | null
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type OrgReview = {
	id: string
	/** Old ID from MongoDB */
	legacyId: string | null
	rating: number | null
	reviewText: string | null
	visible: Generated<boolean>
	deleted: Generated<boolean>
	userId: string
	organizationId: string
	orgServiceId: string | null
	orgLocationId: string | null
	langId: string | null
	/** How confident is the API guess? */
	langConfidence: number | null
	/** From https://perspectiveapi.com/ */
	toxicity: number | null
	lcrCity: string | null
	lcrGovDistId: string | null
	lcrCountryId: string | null
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type orgsearchresults = {
	id: string
	name: string
	attributecategory: unknown
	servicetags: unknown
}
export type OrgService = {
	id: string
	/** Old ID from MongoDB */
	legacyId: string | null
	published: Generated<boolean>
	deleted: Generated<boolean>
	legacyName: string | null
	serviceNameId: string | null
	descriptionId: string | null
	organizationId: string | null
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
	/** Does this record need to be checked by staff after migration? */
	checkMigration: boolean | null
}
export type OrgServiceEmail = {
	orgEmailId: string
	serviceId: string
	linkedAt: Generated<Timestamp>
}
export type OrgServicePhone = {
	orgPhoneId: string
	serviceId: string
	linkedAt: Generated<Timestamp>
}
export type OrgServiceTag = {
	serviceId: string
	tagId: string
	linkedAt: Generated<Timestamp>
}
export type OrgSocialMedia = {
	id: string
	/** Old ID from MongoDB */
	legacyId: string | null
	username: string
	url: string
	deleted: Generated<boolean>
	published: Generated<boolean>
	serviceId: string
	organizationId: string | null
	orgLocationId: string | null
	/** Associated only with location and not overall organization (for large orgs w/ multiple locations) */
	orgLocationOnly: Generated<boolean>
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type OrgWebsite = {
	id: string
	url: string
	descriptionId: string | null
	isPrimary: Generated<boolean>
	deleted: Generated<boolean>
	published: Generated<boolean>
	organizationId: string | null
	orgLocationId: string | null
	orgLocationOnly: Generated<boolean>
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type OrgWebsiteLanguage = {
	orgWebsiteId: string
	languageId: string
	linkedAt: Generated<Timestamp>
}
export type OutsideAPI = {
	id: string
	apiIdentifier: string
	serviceName: string
	organizationId: string | null
	orgLocationId: string | null
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type OutsideAPIService = {
	service: string
	description: string
	urlPattern: string
	apiKey: string | null
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type Permission = {
	id: string
	name: string
	description: string | null
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type PhoneType = {
	id: string
	type: string
	active: Generated<boolean>
	tsKey: string
	tsNs: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type RolePermission = {
	roleId: string
	permissionId: string
	linkedAt: Generated<Timestamp>
}
export type SavedOrganization = {
	listId: string
	organizationId: string
	linkedAt: Generated<Timestamp>
}
export type SavedService = {
	listId: string
	serviceId: string
	linkedAt: Generated<Timestamp>
}
export type ServiceAccess = {
	id: string
	/** Old ID from MongoDB */
	serviceId: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type ServiceAccessAttribute = {
	serviceAccessId: string
	attributeId: string
	linkedAt: Generated<Timestamp>
}
export type ServiceArea = {
	id: string
	organizationId: string | null
	orgLocationId: string | null
	orgServiceId: string | null
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type ServiceAreaCountry = {
	serviceAreaId: string
	countryId: string
	linkedAt: Generated<Timestamp>
}
export type ServiceAreaDist = {
	serviceAreaId: string
	govDistId: string
	linkedAt: Generated<Timestamp>
}
export type ServiceAttribute = {
	orgServiceId: string
	attributeId: string
	linkedAt: Generated<Timestamp>
}
export type ServiceCategory = {
	id: string
	category: string
	active: Generated<boolean>
	tsKey: string
	tsNs: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type ServiceCategoryDefaultAttribute = {
	attributeId: string
	categoryId: string
	linkedAt: Generated<Timestamp>
}
export type ServiceTag = {
	id: string
	name: string
	active: Generated<boolean>
	tsKey: string
	tsNs: string
	categoryId: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type ServiceTagCountry = {
	countryId: string
	serviceId: string
	linkedAt: Generated<Timestamp>
}
export type ServiceTagDefaultAttribute = {
	attributeId: string
	serviceId: string
	linkedAt: Generated<Timestamp>
}
export type ServiceTagNesting = {
	childId: string
	parentId: string
	linkedAt: Generated<Timestamp>
}
export type Session = {
	id: string
	sessionToken: string
	expires: Timestamp
	userId: string
}
export type SocialMediaLink = {
	id: string
	href: string
	icon: string
	serviceId: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type SocialMediaService = {
	id: string
	name: string
	urlBase: string[]
	logoIcon: string
	internal: Generated<boolean>
	tsKey: string
	tsNs: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type Source = {
	id: string
	source: string
	type: SourceType
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type Suggestion = {
	id: string
	data: unknown
	organizationId: string | null
	handled: boolean | null
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type SurveyCommunity = {
	surveyId: string
	communityId: string
}
export type SurveyEthnicity = {
	surveyId: string
	ethnicityId: string
}
export type SurveySOG = {
	surveyId: string
	sogId: string
}
export type TranslatedReview = {
	id: string
	reviewId: string
	languageId: string
	text: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type TranslationKey = {
	/** Item key */
	key: string
	/** Base string */
	text: string
	/** Context */
	context: string | null
	ns: string
	crowdinId: number | null
	interpolation: InterpolationOptions | null
	interpolationValues: unknown | null
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type TranslationNamespace = {
	name: string
	crowdinId: number | null
	exportFile: Generated<boolean>
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type User = {
	id: string
	name: string | null
	email: string
	emailVerified: Timestamp | null
	image: string | null
	/** Old ID from MongoDB */
	legacyId: string | null
	active: Generated<boolean>
	currentCity: string | null
	currentGovDistId: string | null
	currentCountryId: string | null
	legacyHash: string | null
	legacySalt: string | null
	migrateDate: Timestamp | null
	userTypeId: string
	langPrefId: string | null
	sourceId: string | null
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type user_access_token = {
	id: string
	access_token: string | null
}
export type user_refresh_token = {
	id: string
	email: string
	refresh_token: string | null
}
export type UserAttribute = {
	userId: string
	attributeId: string
	linkedAt: Generated<Timestamp>
}
export type UserCommunity = {
	id: string
	/** Use shorthand descriptions - front-end displayable text is defined in Translations */
	community: string
	tsKey: string
	tsNs: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type UserCommunityLink = {
	userId: string
	communityId: string
	linkedAt: Generated<Timestamp>
}
export type UserEthnicity = {
	id: string
	/** Use shorthand descriptions - front-end displayable text is defined in Translations */
	ethnicity: string
	tsKey: string
	tsNs: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type UserImmigration = {
	id: string
	/** Use shorthand descriptions - front-end displayable text is defined in Translations */
	status: string
	tsKey: string
	tsNs: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type UserMail = {
	id: string
	toUserId: string
	/** Array of email addresses */
	toExternal: string[]
	read: Generated<boolean>
	subject: string
	body: string
	from: string | null
	fromUserId: string | null
	responseToId: string | null
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type UserPermission = {
	userId: string
	permissionId: string
	linkedAt: Generated<Timestamp>
}
export type UserRole = {
	id: string
	name: string
	tag: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type UserSavedList = {
	id: string
	name: string
	sharedLinkKey: string | null
	ownedById: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type UserSOGIdentity = {
	id: string
	/** Use shorthand descriptions - front-end displayable text is defined in Translations */
	identifyAs: string
	tsKey: string
	tsNs: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type UserSOGLink = {
	userId: string
	sogIdentityId: string
	linkedAt: Generated<Timestamp>
}
export type UserSurvey = {
	id: string
	birthYear: number | null
	reasonForJoin: string | null
	countryOriginId: string | null
	immigrationId: string | null
	currentCity: string | null
	currentGovDistId: string | null
	currentCountryId: string | null
}
export type UserTitle = {
	id: string
	title: string
	searchable: Generated<boolean>
	tsKey: string
	tsNs: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type UserToOrganization = {
	userId: string
	organizationId: string
	orgTitleId: string | null
	orgEmailId: string | null
	orgPhoneId: string | null
	linkedAt: Generated<Timestamp>
}
export type UserType = {
	id: string
	type: string
	tsKey: string
	tsNs: string
	createdAt: Generated<Timestamp>
	updatedAt: Timestamp
}
export type VerificationToken = {
	identifier: string
	token: string
	expires: Timestamp
}
export type DB = {
	Account: Account
	AssignedRole: AssignedRole
	Attribute: Attribute
	AttributeCategory: AttributeCategory
	AttributeNesting: AttributeNesting
	attributes_by_category: AttributesByCategory
	AttributeSupplement: AttributeSupplement
	AttributeSupplementDataSchema: AttributeSupplementDataSchema
	AttributeToCategory: AttributeToCategory
	AuditLog: AuditLog
	Country: Country
	DataMigration: DataMigration
	FieldVisibility: FieldVisibility
	FreeText: FreeText
	geography_columns: geography_columns
	geometry_columns: geometry_columns
	GovDist: GovDist
	GovDistType: GovDistType
	InternalNote: InternalNote
	Language: Language
	ListSharedWith: ListSharedWith
	LocationAttribute: LocationAttribute
	LocationPermission: LocationPermission
	Organization: Organization
	OrganizationAttribute: OrganizationAttribute
	OrganizationEmail: OrganizationEmail
	OrganizationPermission: OrganizationPermission
	OrganizationPhone: OrganizationPhone
	OrgEmail: OrgEmail
	OrgHours: OrgHours
	OrgLocation: OrgLocation
	OrgLocationEmail: OrgLocationEmail
	OrgLocationPhone: OrgLocationPhone
	OrgLocationService: OrgLocationService
	OrgPhone: OrgPhone
	OrgPhoneLanguage: OrgPhoneLanguage
	OrgPhoto: OrgPhoto
	OrgReview: OrgReview
	orgsearchresults: orgsearchresults
	OrgService: OrgService
	OrgServiceEmail: OrgServiceEmail
	OrgServicePhone: OrgServicePhone
	OrgServiceTag: OrgServiceTag
	OrgSocialMedia: OrgSocialMedia
	OrgWebsite: OrgWebsite
	OrgWebsiteLanguage: OrgWebsiteLanguage
	OutsideAPI: OutsideAPI
	OutsideAPIService: OutsideAPIService
	Permission: Permission
	PhoneType: PhoneType
	RolePermission: RolePermission
	SavedOrganization: SavedOrganization
	SavedService: SavedService
	ServiceAccess: ServiceAccess
	ServiceAccessAttribute: ServiceAccessAttribute
	ServiceArea: ServiceArea
	ServiceAreaCountry: ServiceAreaCountry
	ServiceAreaDist: ServiceAreaDist
	ServiceAttribute: ServiceAttribute
	ServiceCategory: ServiceCategory
	ServiceCategoryDefaultAttribute: ServiceCategoryDefaultAttribute
	ServiceTag: ServiceTag
	ServiceTagCountry: ServiceTagCountry
	ServiceTagDefaultAttribute: ServiceTagDefaultAttribute
	ServiceTagNesting: ServiceTagNesting
	Session: Session
	SocialMediaLink: SocialMediaLink
	SocialMediaService: SocialMediaService
	Source: Source
	Suggestion: Suggestion
	SurveyCommunity: SurveyCommunity
	SurveyEthnicity: SurveyEthnicity
	SurveySOG: SurveySOG
	TranslatedReview: TranslatedReview
	TranslationKey: TranslationKey
	TranslationNamespace: TranslationNamespace
	User: User
	user_access_token: user_access_token
	user_refresh_token: user_refresh_token
	UserAttribute: UserAttribute
	UserCommunity: UserCommunity
	UserCommunityLink: UserCommunityLink
	UserEthnicity: UserEthnicity
	UserImmigration: UserImmigration
	UserMail: UserMail
	UserPermission: UserPermission
	UserRole: UserRole
	UserSavedList: UserSavedList
	UserSOGIdentity: UserSOGIdentity
	UserSOGLink: UserSOGLink
	UserSurvey: UserSurvey
	UserTitle: UserTitle
	UserToOrganization: UserToOrganization
	UserType: UserType
	VerificationToken: VerificationToken
}
