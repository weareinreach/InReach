//#region structure
type JsonPrimitive = null | number | string | boolean
type Nested<V> = V | { [s: string]: V | Nested<V> } | Array<V | Nested<V>>
type Json = Nested<JsonPrimitive>
type Enum_public_attribute_render = 'ATTRIBUTE' | 'COMMUNITY' | 'LEADER' | 'LIST' | 'SERVICE'
type Enum_public_audit_trail_operation = 'DELETE' | 'INSERT' | 'UPDATE'
type Enum_public_filter_type = 'EXCLUDE' | 'INCLUDE'
type Enum_public_interpolation_options = 'CONTEXT' | 'ORDINAL' | 'PLURAL'
type Enum_public_source_type = 'EXTERNAL' | 'ORGANIZATION' | 'SYSTEM' | 'USER'
type Enum_public_visibility_setting = 'LOGGED_IN' | 'NONE' | 'PROVIDER' | 'PUBLIC'
interface Table_public_account {
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
	createdAt: string
	updatedAt: string
}
interface Table_public_assigned_role {
	userId: string
	roleId: string
	linkedAt: string
	authorized: boolean
}
interface Table_public_attribute {
	id: string
	tag: string
	name: string
	icon: string | null
	intDesc: string | null
	active: boolean
	tsKey: string
	tsNs: string
	requireText: boolean
	requireLanguage: boolean
	requireGeo: boolean
	requireBoolean: boolean
	requireData: boolean
	filterType: Enum_public_filter_type | null
	createdAt: string
	updatedAt: string
	showOnLocation: boolean | null
	iconBg: string | null
	requiredSchemaId: string | null
	activeForSuggest: boolean | null
}
interface Table_public_attribute_category {
	id: string
	tag: string
	name: string
	icon: string | null
	intDesc: string | null
	active: boolean
	ns: string
	createdAt: string
	updatedAt: string
	renderVariant: Enum_public_attribute_render | null
}
interface Table_public_attribute_nesting {
	childId: string
	parentId: string
	linkedAt: string
}
interface Table_public_attribute_supplement {
	id: string
	active: boolean
	data: Json | null
	boolean: boolean | null
	textId: string | null
	countryId: string | null
	languageId: string | null
	createdAt: string
	updatedAt: string
	govDistId: string | null
	attributeId: string
	locationId: string | null
	organizationId: string | null
	serviceId: string | null
	userId: string | null
}
interface Table_public_attribute_supplement_data_schema {
	id: string
	tag: string
	name: string
	definition: Json
	createdAt: string
	updatedAt: string
	active: boolean
}
interface Table_public_attribute_to_category {
	attributeId: string
	categoryId: string
	linkedAt: string
}
interface Table_public_audit_trail {
	id: string
	table: string
	/**
	 * We couldn't determine the type of this column. The type might be coming from an unknown extension or be
	 * specific to your database. Please if it's a common used type report this issue so we can fix it!
	 * Otherwise, please manually type this column by casting it to the correct type.
	 *
	 * @example Here is a cast example for copycat use:
	 *
	 *     copycat.scramble(row.unknownColumn as string)
	 */
	table_oid: unknown
	recordId: string[] | null
	operation: Enum_public_audit_trail_operation
	old: Json | null
	new: Json | null
	timestamp: string
	actorId: string
}
interface Table_public_country {
	id: string
	cca2: string
	cca3: string
	name: string
	dialCode: number | null
	flag: string
	tsKey: string
	tsNs: string
	demonymKey: string | null
	demonymNs: string | null
	createdAt: string
	updatedAt: string
	activeForOrgs: boolean | null
	activeForSuggest: boolean | null
	geoDataId: string | null
	articlePrefix: boolean | null
}
interface Table_public_data_migration {
	id: string
	title: string
	description: string | null
	createdBy: string
	appliedAt: string
	jobId: string
}
interface Table_public_field_visibility {
	id: string
	userId: string
	name: Enum_public_visibility_setting
	email: Enum_public_visibility_setting
	image: Enum_public_visibility_setting
	ethnicity: Enum_public_visibility_setting
	countryOrigin: Enum_public_visibility_setting
	SOG: Enum_public_visibility_setting
	communities: Enum_public_visibility_setting
	currentCity: Enum_public_visibility_setting
	currentGovDist: Enum_public_visibility_setting
	currentCountry: Enum_public_visibility_setting
	userType: Enum_public_visibility_setting
	associatedOrg: Enum_public_visibility_setting
	orgTitle: Enum_public_visibility_setting
	createdAt: Enum_public_visibility_setting
	recordCreatedAt: string
	recordupdatedAt: string
}
interface Table_public_free_text {
	id: string
	key: string
	ns: string
	createdAt: string
	updatedAt: string
}
interface Table_public_geo_data {
	id: string
	name: string
	/**
	 * We couldn't determine the type of this column. The type might be coming from an unknown extension or be
	 * specific to your database. Please if it's a common used type report this issue so we can fix it!
	 * Otherwise, please manually type this column by casting it to the correct type.
	 *
	 * @example Here is a cast example for copycat use:
	 *
	 *     copycat.scramble(row.unknownColumn as string)
	 */
	geo: unknown
	iso: string
	iso2: string | null
	abbrev: string | null
	type: string | null
	adminLevel: number
}
interface Table_public_gov_dist {
	id: string
	name: string
	slug: string
	iso: string | null
	abbrev: string | null
	countryId: string
	govDistTypeId: string
	isPrimary: boolean | null
	parentId: string | null
	tsKey: string
	tsNs: string
	createdAt: string
	updatedAt: string
	active: boolean | null
	geoDataId: string | null
}
interface Table_public_gov_dist_type {
	id: string
	name: string
	tsKey: string
	tsNs: string
	createdAt: string
	updatedAt: string
}
interface Table_public_internal_note {
	id: string
	legacyId: string | null
	text: string
	attributeId: string | null
	attributeCategoryId: string | null
	attributeSupplementId: string | null
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
	serviceCategoryId: string | null
	serviceTagId: string | null
	socialMediaLinkId: string | null
	socialMediaServiceId: string | null
	sourceId: string | null
	translationKey: string | null
	translationNs: string | null
	translationNamespaceName: string | null
	createdAt: string
	updatedAt: string
	attributeSupplementDataSchemaId: string | null
	suggestionId: string | null
}
interface Table_public_language {
	id: string
	languageName: string
	localeCode: string
	iso6392: string | null
	nativeName: string
	activelyTranslated: boolean
	createdAt: string
	updatedAt: string
	defaultSort: number | null
	groupCommon: boolean | null
}
interface Table_public_list_shared_with {
	userId: string
	listId: string
	linkedAt: string
}
interface Table_public_location_permission {
	userId: string
	permissionId: string
	authorized: boolean
	orgLocationId: string
	createdAt: string
	updatedAt: string
}
interface Table_public_org_email {
	id: string
	legacyId: string | null
	legacyDesc: string | null
	firstName: string | null
	lastName: string | null
	primary: boolean
	email: string
	published: boolean
	deleted: boolean
	titleId: string | null
	descriptionId: string | null
	locationOnly: boolean
	serviceOnly: boolean
	createdAt: string
	updatedAt: string
}
interface Table_public_org_hours {
	id: string
	dayIndex: number
	start: string
	end: string
	closed: boolean
	orgLocId: string | null
	orgServiceId: string | null
	organizationId: string | null
	needAssignment: boolean
	needReview: boolean
	legacyId: string | null
	legacyName: string | null
	legacyNote: string | null
	legacyStart: string | null
	legacyEnd: string | null
	legacyTz: string | null
	createdAt: string
	updatedAt: string
	tz: string | null
	active: boolean
	interval: Json | null
	open24hours: boolean
}
interface Table_public_org_location {
	id: string
	legacyId: string | null
	name: string | null
	street1: string | null
	street2: string | null
	city: string
	postCode: string | null
	primary: boolean
	govDistId: string | null
	countryId: string
	longitude: number | null
	latitude: number | null
	/**
	 * We couldn't determine the type of this column. The type might be coming from an unknown extension or be
	 * specific to your database. Please if it's a common used type report this issue so we can fix it!
	 * Otherwise, please manually type this column by casting it to the correct type.
	 *
	 * @example Here is a cast example for copycat use:
	 *
	 *     copycat.scramble(row.unknownColumn as string)
	 */
	geo: unknown | null
	geoJSON: Json | null
	geoWKT: string | null
	published: boolean
	deleted: boolean
	orgId: string
	apiLocationId: string | null
	createdAt: string
	updatedAt: string
	checkMigration: boolean | null
	descriptionId: string | null
	mailOnly: boolean
	mapCityOnly: boolean
	notVisitable: boolean
}
interface Table_public_org_location_email {
	orgLocationId: string
	orgEmailId: string
	linkedAt: string
	active: boolean
}
interface Table_public_org_location_phone {
	orgLocationId: string
	phoneId: string
	linkedAt: string
	active: boolean
}
interface Table_public_org_location_service {
	orgLocationId: string
	serviceId: string
	linkedAt: string
	active: boolean
}
interface Table_public_org_location_social_media {
	orgLocationId: string
	socialMediaId: string
	linkedAt: string
	active: boolean
}
interface Table_public_org_location_website {
	orgLocationId: string
	orgWebsiteId: string
	linkedAt: string
	active: boolean
}
interface Table_public_org_phone {
	id: string
	legacyId: string | null
	legacyDesc: string | null
	number: string
	ext: string | null
	primary: boolean
	published: boolean
	deleted: boolean
	migrationReview: boolean | null
	countryId: string
	phoneTypeId: string | null
	locationOnly: boolean
	createdAt: string
	updatedAt: string
	descriptionId: string | null
	serviceOnly: boolean
	countryCode: string | null
}
interface Table_public_org_phone_language {
	orgPhoneId: string
	languageId: string
	linkedAt: string
	active: boolean
}
interface Table_public_org_photo {
	id: string
	src: string
	height: number | null
	width: number | null
	published: boolean
	deleted: boolean
	orgId: string | null
	orgLocationId: string | null
	createdAt: string
	updatedAt: string
}
interface Table_public_org_review {
	id: string
	legacyId: string | null
	rating: number | null
	reviewText: string | null
	visible: boolean
	deleted: boolean
	userId: string
	organizationId: string
	orgServiceId: string | null
	orgLocationId: string | null
	langId: string | null
	langConfidence: number | null
	toxicity: number | null
	lcrCity: string | null
	lcrGovDistId: string | null
	lcrCountryId: string | null
	createdAt: string
	updatedAt: string
	featured: boolean | null
}
interface Table_public_org_service {
	id: string
	legacyId: string | null
	published: boolean
	deleted: boolean
	legacyName: string | null
	descriptionId: string | null
	organizationId: string | null
	createdAt: string
	updatedAt: string
	checkMigration: boolean | null
	serviceNameId: string | null
	crisisSupportOnly: boolean | null
}
interface Table_public_org_service_email {
	orgEmailId: string
	serviceId: string
	linkedAt: string
	active: boolean
}
interface Table_public_org_service_phone {
	orgPhoneId: string
	serviceId: string
	linkedAt: string
	active: boolean
}
interface Table_public_org_service_tag {
	serviceId: string
	tagId: string
	linkedAt: string
	active: boolean
}
interface Table_public_org_service_website {
	orgWebsiteId: string
	serviceId: string
	linkedAt: string
	active: boolean
}
interface Table_public_org_social_media {
	id: string
	legacyId: string | null
	username: string
	url: string
	deleted: boolean
	published: boolean
	serviceId: string
	organizationId: string | null
	orgLocationOnly: boolean
	createdAt: string
	updatedAt: string
}
interface Table_public_org_website {
	id: string
	url: string
	descriptionId: string | null
	organizationId: string | null
	orgLocationOnly: boolean
	createdAt: string
	updatedAt: string
	isPrimary: boolean
	deleted: boolean
	published: boolean
}
interface Table_public_org_website_language {
	orgWebsiteId: string
	languageId: string
	linkedAt: string
	active: boolean
}
interface Table_public_organization {
	id: string
	legacyId: string | null
	name: string
	slug: string
	legacySlug: string | null
	descriptionId: string | null
	deleted: boolean
	published: boolean
	lastVerified: string | null
	sourceId: string
	createdAt: string
	updatedAt: string
	checkMigration: boolean | null
	crisisResource: boolean | null
	crisisResourceSort: number | null
}
interface Table_public_organization_email {
	orgEmailId: string
	organizationId: string
	linkedAt: string
	active: boolean
}
interface Table_public_organization_permission {
	userId: string
	permissionId: string
	authorized: boolean
	organizationId: string
	linkedAt: string
	createdAt: string
	updatedAt: string
}
interface Table_public_organization_phone {
	organizationId: string
	phoneId: string
	linkedAt: string
	active: boolean
}
interface Table_public_outside_api {
	id: string
	apiIdentifier: string
	serviceName: string
	organizationId: string | null
	orgLocationId: string | null
	createdAt: string
	updatedAt: string
	active: boolean
}
interface Table_public_outside_api_service {
	service: string
	description: string
	urlPattern: string
	apiKey: string | null
	createdAt: string
	updatedAt: string
	active: boolean
}
interface Table_public_permission {
	id: string
	name: string
	description: string | null
	createdAt: string
	updatedAt: string
	active: boolean
}
interface Table_public_phone_type {
	id: string
	type: string
	tsKey: string
	tsNs: string
	createdAt: string
	updatedAt: string
	active: boolean
}
interface Table_public_role_permission {
	roleId: string
	permissionId: string
	linkedAt: string
	active: boolean
}
interface Table_public_saved_organization {
	listId: string
	organizationId: string
	linkedAt: string
}
interface Table_public_saved_service {
	listId: string
	serviceId: string
	linkedAt: string
}
interface Table_public_service_area {
	id: string
	organizationId: string | null
	orgLocationId: string | null
	orgServiceId: string | null
	createdAt: string
	updatedAt: string
	active: boolean
}
interface Table_public_service_area_country {
	serviceAreaId: string
	countryId: string
	linkedAt: string
	active: boolean
}
interface Table_public_service_area_dist {
	serviceAreaId: string
	govDistId: string
	linkedAt: string
	active: boolean
}
interface Table_public_service_category {
	id: string
	category: string
	active: boolean
	tsKey: string
	tsNs: string
	createdAt: string
	updatedAt: string
	activeForSuggest: boolean | null
	crisisSupportOnly: boolean | null
}
interface Table_public_service_category_default_attribute {
	attributeId: string
	categoryId: string
	linkedAt: string
	active: boolean
}
interface Table_public_service_tag {
	id: string
	name: string
	active: boolean
	tsKey: string
	tsNs: string
	createdAt: string
	updatedAt: string
	crisisSupportOnly: boolean | null
	primaryCategoryId: string
}
interface Table_public_service_tag_country {
	countryId: string
	serviceId: string
	linkedAt: string
	active: boolean
}
interface Table_public_service_tag_default_attribute {
	attributeId: string
	serviceId: string
	linkedAt: string
	active: boolean
}
interface Table_public_service_tag_nesting {
	childId: string
	parentId: string
	linkedAt: string
}
interface Table_public_service_tag_to_category {
	categoryId: string
	serviceTagId: string
	linkedAt: string
	active: boolean
}
interface Table_public_session {
	id: string
	sessionToken: string
	expires: string
	userId: string
}
interface Table_public_slug_redirect {
	id: string
	from: string
	to: string
	orgId: string
	createdAt: string
	updatedAt: string
}
interface Table_public_social_media_link {
	id: string
	href: string
	icon: string
	serviceId: string
	createdAt: string
	updatedAt: string
}
interface Table_public_social_media_service {
	id: string
	name: string
	urlBase: string[] | null
	logoIcon: string
	internal: boolean
	tsKey: string
	tsNs: string
	createdAt: string
	updatedAt: string
	active: boolean
}
interface Table_public_source {
	id: string
	source: string
	type: Enum_public_source_type
	createdAt: string
	updatedAt: string
	active: boolean
}
interface Table_public_suggestion {
	id: string
	data: Json
	organizationId: string | null
	createdAt: string
	updatedAt: string
	handled: boolean | null
}
interface Table_public_survey_community {
	surveyId: string
	communityId: string
}
interface Table_public_survey_ethnicity {
	surveyId: string
	ethnicityId: string
}
interface Table_public_survey_sog {
	surveyId: string
	sogId: string
}
interface Table_public_translated_review {
	id: string
	reviewId: string
	languageId: string
	text: string
	createdAt: string
	updatedAt: string
}
interface Table_public_translation_key {
	key: string
	text: string
	context: string | null
	ns: string
	createdAt: string
	updatedAt: string
	crowdinId: number | null
	interpolation: Enum_public_interpolation_options | null
	interpolationValues: Json | null
}
interface Table_public_translation_namespace {
	name: string
	exportFile: boolean
	createdAt: string
	updatedAt: string
	crowdinId: number | null
}
interface Table_public_user {
	id: string
	name: string | null
	email: string
	emailVerified: string | null
	image: string | null
	legacyId: string | null
	active: boolean
	currentCity: string | null
	currentGovDistId: string | null
	currentCountryId: string | null
	legacyHash: string | null
	legacySalt: string | null
	migrateDate: string | null
	userTypeId: string
	langPrefId: string | null
	sourceId: string | null
	createdAt: string
	updatedAt: string
	signupData: Json | null
}
interface Table_public_user_community {
	id: string
	community: string
	tsKey: string
	tsNs: string
	createdAt: string
	updatedAt: string
	active: boolean
}
interface Table_public_user_community_link {
	userId: string
	communityId: string
	linkedAt: string
}
interface Table_public_user_ethnicity {
	id: string
	ethnicity: string
	tsKey: string
	tsNs: string
	createdAt: string
	updatedAt: string
	active: boolean
}
interface Table_public_user_immigration {
	id: string
	status: string
	tsKey: string
	tsNs: string
	createdAt: string
	updatedAt: string
	active: boolean
}
interface Table_public_user_mail {
	id: string
	toUserId: string
	toExternal: string[] | null
	read: boolean
	subject: string
	body: string
	from: string | null
	fromUserId: string | null
	responseToId: string | null
	createdAt: string
	updatedAt: string
}
interface Table_public_user_permission {
	userId: string
	permissionId: string
	linkedAt: string
	authorized: boolean
}
interface Table_public_user_role {
	id: string
	name: string
	tag: string
	createdAt: string
	updatedAt: string
	active: boolean
}
interface Table_public_user_sog_identity {
	id: string
	identifyAs: string
	tsKey: string
	tsNs: string
	createdAt: string
	updatedAt: string
	active: boolean
}
interface Table_public_user_sog_link {
	userId: string
	sogIdentityId: string
	linkedAt: string
}
interface Table_public_user_saved_list {
	id: string
	name: string
	sharedLinkKey: string | null
	ownedById: string
	createdAt: string
	updatedAt: string
}
interface Table_public_user_survey {
	id: string
	birthYear: number | null
	reasonForJoin: string | null
	countryOriginId: string | null
	immigrationId: string | null
	currentCity: string | null
	currentGovDistId: string | null
	currentCountryId: string | null
	ethnicityOther: string | null
	immigrationOther: string | null
}
interface Table_public_user_title {
	id: string
	title: string
	searchable: boolean
	tsKey: string
	tsNs: string
	createdAt: string
	updatedAt: string
	active: boolean
}
interface Table_public_user_to_organization {
	userId: string
	organizationId: string
	orgTitleId: string | null
	orgEmailId: string | null
	orgPhoneId: string | null
	linkedAt: string
	authorized: boolean
}
interface Table_public_user_type {
	id: string
	type: string
	tsKey: string
	tsNs: string
	createdAt: string
	updatedAt: string
	active: boolean
}
interface Table_public_verification_token {
	identifier: string
	token: string
	expires: string
}
interface Table_public_prisma_migrations {
	id: string
	checksum: string
	finished_at: string | null
	migration_name: string
	logs: string | null
	rolled_back_at: string | null
	started_at: string
	applied_steps_count: number
}
interface Table_public_spatial_ref_sys {
	srid: number
	auth_name: string | null
	auth_srid: number | null
	srtext: string | null
	proj4text: string | null
}
interface Schema_public {
	Account: Table_public_account
	AssignedRole: Table_public_assigned_role
	Attribute: Table_public_attribute
	AttributeCategory: Table_public_attribute_category
	AttributeNesting: Table_public_attribute_nesting
	AttributeSupplement: Table_public_attribute_supplement
	AttributeSupplementDataSchema: Table_public_attribute_supplement_data_schema
	AttributeToCategory: Table_public_attribute_to_category
	AuditTrail: Table_public_audit_trail
	Country: Table_public_country
	DataMigration: Table_public_data_migration
	FieldVisibility: Table_public_field_visibility
	FreeText: Table_public_free_text
	GeoData: Table_public_geo_data
	GovDist: Table_public_gov_dist
	GovDistType: Table_public_gov_dist_type
	InternalNote: Table_public_internal_note
	Language: Table_public_language
	ListSharedWith: Table_public_list_shared_with
	LocationPermission: Table_public_location_permission
	OrgEmail: Table_public_org_email
	OrgHours: Table_public_org_hours
	OrgLocation: Table_public_org_location
	OrgLocationEmail: Table_public_org_location_email
	OrgLocationPhone: Table_public_org_location_phone
	OrgLocationService: Table_public_org_location_service
	OrgLocationSocialMedia: Table_public_org_location_social_media
	OrgLocationWebsite: Table_public_org_location_website
	OrgPhone: Table_public_org_phone
	OrgPhoneLanguage: Table_public_org_phone_language
	OrgPhoto: Table_public_org_photo
	OrgReview: Table_public_org_review
	OrgService: Table_public_org_service
	OrgServiceEmail: Table_public_org_service_email
	OrgServicePhone: Table_public_org_service_phone
	OrgServiceTag: Table_public_org_service_tag
	OrgServiceWebsite: Table_public_org_service_website
	OrgSocialMedia: Table_public_org_social_media
	OrgWebsite: Table_public_org_website
	OrgWebsiteLanguage: Table_public_org_website_language
	Organization: Table_public_organization
	OrganizationEmail: Table_public_organization_email
	OrganizationPermission: Table_public_organization_permission
	OrganizationPhone: Table_public_organization_phone
	OutsideAPI: Table_public_outside_api
	OutsideAPIService: Table_public_outside_api_service
	Permission: Table_public_permission
	PhoneType: Table_public_phone_type
	RolePermission: Table_public_role_permission
	SavedOrganization: Table_public_saved_organization
	SavedService: Table_public_saved_service
	ServiceArea: Table_public_service_area
	ServiceAreaCountry: Table_public_service_area_country
	ServiceAreaDist: Table_public_service_area_dist
	ServiceCategory: Table_public_service_category
	ServiceCategoryDefaultAttribute: Table_public_service_category_default_attribute
	ServiceTag: Table_public_service_tag
	ServiceTagCountry: Table_public_service_tag_country
	ServiceTagDefaultAttribute: Table_public_service_tag_default_attribute
	ServiceTagNesting: Table_public_service_tag_nesting
	ServiceTagToCategory: Table_public_service_tag_to_category
	Session: Table_public_session
	SlugRedirect: Table_public_slug_redirect
	SocialMediaLink: Table_public_social_media_link
	SocialMediaService: Table_public_social_media_service
	Source: Table_public_source
	Suggestion: Table_public_suggestion
	SurveyCommunity: Table_public_survey_community
	SurveyEthnicity: Table_public_survey_ethnicity
	SurveySOG: Table_public_survey_sog
	TranslatedReview: Table_public_translated_review
	TranslationKey: Table_public_translation_key
	TranslationNamespace: Table_public_translation_namespace
	User: Table_public_user
	UserCommunity: Table_public_user_community
	UserCommunityLink: Table_public_user_community_link
	UserEthnicity: Table_public_user_ethnicity
	UserImmigration: Table_public_user_immigration
	UserMail: Table_public_user_mail
	UserPermission: Table_public_user_permission
	UserRole: Table_public_user_role
	UserSOGIdentity: Table_public_user_sog_identity
	UserSOGLink: Table_public_user_sog_link
	UserSavedList: Table_public_user_saved_list
	UserSurvey: Table_public_user_survey
	UserTitle: Table_public_user_title
	UserToOrganization: Table_public_user_to_organization
	UserType: Table_public_user_type
	VerificationToken: Table_public_verification_token
	_prisma_migrations: Table_public_prisma_migrations
	spatial_ref_sys: Table_public_spatial_ref_sys
}
interface Database {
	public: Schema_public
}
interface Extension {
	public: 'pg_stat_statements' | 'postgis'
}
interface Tables_relationships {
	'public.Account': {
		parent: {
			Account_userId_fkey: 'public.User'
		}
		children: {}
	}
	'public.AssignedRole': {
		parent: {
			AssignedRole_userId_fkey: 'public.User'
			AssignedRole_roleId_fkey: 'public.UserRole'
		}
		children: {}
	}
	'public.Attribute': {
		parent: {
			Attribute_requiredSchemaId_fkey: 'public.AttributeSupplementDataSchema'
			Attribute_tsKey_tsNs_fkey: 'public.TranslationKey'
		}
		children: {
			AttributeNesting_childId_fkey: 'public.AttributeNesting'
			AttributeNesting_parentId_fkey: 'public.AttributeNesting'
			AttributeSupplement_attributeId_fkey: 'public.AttributeSupplement'
			AttributeToCategory_attributeId_fkey: 'public.AttributeToCategory'
			InternalNote_attributeId_fkey: 'public.InternalNote'
			ServiceCategoryDefaultAttribute_attributeId_fkey: 'public.ServiceCategoryDefaultAttribute'
			ServiceTagDefaultAttribute_attributeId_fkey: 'public.ServiceTagDefaultAttribute'
		}
	}
	'public.AttributeCategory': {
		parent: {
			AttributeCategory_ns_fkey: 'public.TranslationNamespace'
		}
		children: {
			AttributeToCategory_categoryId_fkey: 'public.AttributeToCategory'
			InternalNote_attributeCategoryId_fkey: 'public.InternalNote'
		}
	}
	'public.AttributeNesting': {
		parent: {
			AttributeNesting_childId_fkey: 'public.Attribute'
			AttributeNesting_parentId_fkey: 'public.Attribute'
		}
		children: {}
	}
	'public.AttributeSupplement': {
		parent: {
			AttributeSupplement_attributeId_fkey: 'public.Attribute'
			AttributeSupplement_countryId_fkey: 'public.Country'
			AttributeSupplement_textId_fkey: 'public.FreeText'
			AttributeSupplement_govDistId_fkey: 'public.GovDist'
			AttributeSupplement_languageId_fkey: 'public.Language'
			AttributeSupplement_locationId_fkey: 'public.OrgLocation'
			AttributeSupplement_serviceId_fkey: 'public.OrgService'
			AttributeSupplement_organizationId_fkey: 'public.Organization'
			AttributeSupplement_userId_fkey: 'public.User'
		}
		children: {
			InternalNote_attributeSupplementId_fkey: 'public.InternalNote'
		}
	}
	'public.AttributeSupplementDataSchema': {
		parent: {}
		children: {
			Attribute_requiredSchemaId_fkey: 'public.Attribute'
			InternalNote_attributeSupplementDataSchemaId_fkey: 'public.InternalNote'
		}
	}
	'public.AttributeToCategory': {
		parent: {
			AttributeToCategory_attributeId_fkey: 'public.Attribute'
			AttributeToCategory_categoryId_fkey: 'public.AttributeCategory'
		}
		children: {}
	}
	'public.Country': {
		parent: {
			Country_geoDataId_fkey: 'public.GeoData'
			Country_demonymKey_demonymNs_fkey: 'public.TranslationKey'
			Country_tsKey_tsNs_fkey: 'public.TranslationKey'
		}
		children: {
			AttributeSupplement_countryId_fkey: 'public.AttributeSupplement'
			GovDist_countryId_fkey: 'public.GovDist'
			InternalNote_countryId_fkey: 'public.InternalNote'
			OrgLocation_countryId_fkey: 'public.OrgLocation'
			OrgPhone_countryId_fkey: 'public.OrgPhone'
			OrgReview_lcrCountryId_fkey: 'public.OrgReview'
			ServiceAreaCountry_countryId_fkey: 'public.ServiceAreaCountry'
			ServiceTagCountry_countryId_fkey: 'public.ServiceTagCountry'
			User_currentCountryId_fkey: 'public.User'
			UserSurvey_countryOriginId_fkey: 'public.UserSurvey'
			UserSurvey_currentCountryId_fkey: 'public.UserSurvey'
		}
	}
	'public.FieldVisibility': {
		parent: {
			FieldVisibility_userId_fkey: 'public.User'
		}
		children: {}
	}
	'public.FreeText': {
		parent: {
			FreeText_key_ns_fkey: 'public.TranslationKey'
		}
		children: {
			AttributeSupplement_textId_fkey: 'public.AttributeSupplement'
			OrgEmail_descriptionId_fkey: 'public.OrgEmail'
			OrgLocation_descriptionId_fkey: 'public.OrgLocation'
			OrgPhone_descriptionId_fkey: 'public.OrgPhone'
			OrgService_descriptionId_fkey: 'public.OrgService'
			OrgService_serviceNameId_fkey: 'public.OrgService'
			OrgWebsite_descriptionId_fkey: 'public.OrgWebsite'
			Organization_descriptionId_fkey: 'public.Organization'
		}
	}
	'public.GeoData': {
		parent: {}
		children: {
			Country_geoDataId_fkey: 'public.Country'
			GovDist_geoDataId_fkey: 'public.GovDist'
		}
	}
	'public.GovDist': {
		parent: {
			GovDist_countryId_fkey: 'public.Country'
			GovDist_geoDataId_fkey: 'public.GeoData'
			GovDist_parentId_fkey: 'public.GovDist'
			GovDist_govDistTypeId_fkey: 'public.GovDistType'
			GovDist_tsKey_tsNs_fkey: 'public.TranslationKey'
		}
		children: {
			AttributeSupplement_govDistId_fkey: 'public.AttributeSupplement'
			GovDist_parentId_fkey: 'public.GovDist'
			InternalNote_govDistId_fkey: 'public.InternalNote'
			OrgLocation_govDistId_fkey: 'public.OrgLocation'
			OrgReview_lcrGovDistId_fkey: 'public.OrgReview'
			ServiceAreaDist_govDistId_fkey: 'public.ServiceAreaDist'
			User_currentGovDistId_fkey: 'public.User'
			UserSurvey_currentGovDistId_fkey: 'public.UserSurvey'
		}
	}
	'public.GovDistType': {
		parent: {
			GovDistType_tsKey_tsNs_fkey: 'public.TranslationKey'
		}
		children: {
			GovDist_govDistTypeId_fkey: 'public.GovDist'
			InternalNote_govDistTypeId_fkey: 'public.InternalNote'
		}
	}
	'public.InternalNote': {
		parent: {
			InternalNote_attributeId_fkey: 'public.Attribute'
			InternalNote_attributeCategoryId_fkey: 'public.AttributeCategory'
			InternalNote_attributeSupplementId_fkey: 'public.AttributeSupplement'
			InternalNote_attributeSupplementDataSchemaId_fkey: 'public.AttributeSupplementDataSchema'
			InternalNote_countryId_fkey: 'public.Country'
			InternalNote_govDistId_fkey: 'public.GovDist'
			InternalNote_govDistTypeId_fkey: 'public.GovDistType'
			InternalNote_languageId_fkey: 'public.Language'
			InternalNote_orgEmailId_fkey: 'public.OrgEmail'
			InternalNote_orgHoursId_fkey: 'public.OrgHours'
			InternalNote_orgLocationId_fkey: 'public.OrgLocation'
			InternalNote_orgPhoneId_fkey: 'public.OrgPhone'
			InternalNote_orgPhotoId_fkey: 'public.OrgPhoto'
			InternalNote_orgReviewId_fkey: 'public.OrgReview'
			InternalNote_orgServiceId_fkey: 'public.OrgService'
			InternalNote_orgSocialMediaId_fkey: 'public.OrgSocialMedia'
			InternalNote_orgWebsiteId_fkey: 'public.OrgWebsite'
			InternalNote_organizationId_fkey: 'public.Organization'
			InternalNote_outsideApiId_fkey: 'public.OutsideAPI'
			InternalNote_outsideAPIServiceService_fkey: 'public.OutsideAPIService'
			InternalNote_permissionId_fkey: 'public.Permission'
			InternalNote_phoneTypeId_fkey: 'public.PhoneType'
			InternalNote_serviceCategoryId_fkey: 'public.ServiceCategory'
			InternalNote_serviceTagId_fkey: 'public.ServiceTag'
			InternalNote_socialMediaLinkId_fkey: 'public.SocialMediaLink'
			InternalNote_socialMediaServiceId_fkey: 'public.SocialMediaService'
			InternalNote_sourceId_fkey: 'public.Source'
			InternalNote_suggestionId_fkey: 'public.Suggestion'
			InternalNote_translationKey_translationNs_fkey: 'public.TranslationKey'
			InternalNote_translationNamespaceName_fkey: 'public.TranslationNamespace'
		}
		children: {}
	}
	'public.Language': {
		parent: {}
		children: {
			AttributeSupplement_languageId_fkey: 'public.AttributeSupplement'
			InternalNote_languageId_fkey: 'public.InternalNote'
			OrgPhoneLanguage_languageId_fkey: 'public.OrgPhoneLanguage'
			OrgReview_langId_fkey: 'public.OrgReview'
			OrgWebsiteLanguage_languageId_fkey: 'public.OrgWebsiteLanguage'
			TranslatedReview_languageId_fkey: 'public.TranslatedReview'
			User_langPrefId_fkey: 'public.User'
		}
	}
	'public.ListSharedWith': {
		parent: {
			ListSharedWith_userId_fkey: 'public.User'
			ListSharedWith_listId_fkey: 'public.UserSavedList'
		}
		children: {}
	}
	'public.LocationPermission': {
		parent: {
			LocationPermission_orgLocationId_fkey: 'public.OrgLocation'
			LocationPermission_permissionId_fkey: 'public.Permission'
			LocationPermission_userId_fkey: 'public.User'
		}
		children: {}
	}
	'public.OrgEmail': {
		parent: {
			OrgEmail_descriptionId_fkey: 'public.FreeText'
			OrgEmail_titleId_fkey: 'public.UserTitle'
		}
		children: {
			InternalNote_orgEmailId_fkey: 'public.InternalNote'
			OrgLocationEmail_orgEmailId_fkey: 'public.OrgLocationEmail'
			OrgServiceEmail_orgEmailId_fkey: 'public.OrgServiceEmail'
			OrganizationEmail_orgEmailId_fkey: 'public.OrganizationEmail'
			UserToOrganization_orgEmailId_fkey: 'public.UserToOrganization'
		}
	}
	'public.OrgHours': {
		parent: {
			OrgHours_orgLocId_fkey: 'public.OrgLocation'
			OrgHours_orgServiceId_fkey: 'public.OrgService'
			OrgHours_organizationId_fkey: 'public.Organization'
		}
		children: {
			InternalNote_orgHoursId_fkey: 'public.InternalNote'
		}
	}
	'public.OrgLocation': {
		parent: {
			OrgLocation_countryId_fkey: 'public.Country'
			OrgLocation_descriptionId_fkey: 'public.FreeText'
			OrgLocation_govDistId_fkey: 'public.GovDist'
			OrgLocation_orgId_fkey: 'public.Organization'
		}
		children: {
			AttributeSupplement_locationId_fkey: 'public.AttributeSupplement'
			InternalNote_orgLocationId_fkey: 'public.InternalNote'
			LocationPermission_orgLocationId_fkey: 'public.LocationPermission'
			OrgHours_orgLocId_fkey: 'public.OrgHours'
			OrgLocationEmail_orgLocationId_fkey: 'public.OrgLocationEmail'
			OrgLocationPhone_orgLocationId_fkey: 'public.OrgLocationPhone'
			OrgLocationService_orgLocationId_fkey: 'public.OrgLocationService'
			OrgLocationSocialMedia_orgLocationId_fkey: 'public.OrgLocationSocialMedia'
			OrgLocationWebsite_orgLocationId_fkey: 'public.OrgLocationWebsite'
			OrgPhoto_orgLocationId_fkey: 'public.OrgPhoto'
			OrgReview_orgLocationId_fkey: 'public.OrgReview'
			OutsideAPI_orgLocationId_fkey: 'public.OutsideAPI'
			ServiceArea_orgLocationId_fkey: 'public.ServiceArea'
		}
	}
	'public.OrgLocationEmail': {
		parent: {
			OrgLocationEmail_orgEmailId_fkey: 'public.OrgEmail'
			OrgLocationEmail_orgLocationId_fkey: 'public.OrgLocation'
		}
		children: {}
	}
	'public.OrgLocationPhone': {
		parent: {
			OrgLocationPhone_orgLocationId_fkey: 'public.OrgLocation'
			OrgLocationPhone_phoneId_fkey: 'public.OrgPhone'
		}
		children: {}
	}
	'public.OrgLocationService': {
		parent: {
			OrgLocationService_orgLocationId_fkey: 'public.OrgLocation'
			OrgLocationService_serviceId_fkey: 'public.OrgService'
		}
		children: {}
	}
	'public.OrgLocationSocialMedia': {
		parent: {
			OrgLocationSocialMedia_orgLocationId_fkey: 'public.OrgLocation'
			OrgLocationSocialMedia_socialMediaId_fkey: 'public.OrgSocialMedia'
		}
		children: {}
	}
	'public.OrgLocationWebsite': {
		parent: {
			OrgLocationWebsite_orgLocationId_fkey: 'public.OrgLocation'
			OrgLocationWebsite_orgWebsiteId_fkey: 'public.OrgWebsite'
		}
		children: {}
	}
	'public.OrgPhone': {
		parent: {
			OrgPhone_countryId_fkey: 'public.Country'
			OrgPhone_descriptionId_fkey: 'public.FreeText'
			OrgPhone_phoneTypeId_fkey: 'public.PhoneType'
		}
		children: {
			InternalNote_orgPhoneId_fkey: 'public.InternalNote'
			OrgLocationPhone_phoneId_fkey: 'public.OrgLocationPhone'
			OrgPhoneLanguage_orgPhoneId_fkey: 'public.OrgPhoneLanguage'
			OrgServicePhone_orgPhoneId_fkey: 'public.OrgServicePhone'
			OrganizationPhone_phoneId_fkey: 'public.OrganizationPhone'
			UserToOrganization_orgPhoneId_fkey: 'public.UserToOrganization'
		}
	}
	'public.OrgPhoneLanguage': {
		parent: {
			OrgPhoneLanguage_languageId_fkey: 'public.Language'
			OrgPhoneLanguage_orgPhoneId_fkey: 'public.OrgPhone'
		}
		children: {}
	}
	'public.OrgPhoto': {
		parent: {
			OrgPhoto_orgLocationId_fkey: 'public.OrgLocation'
			OrgPhoto_orgId_fkey: 'public.Organization'
		}
		children: {
			InternalNote_orgPhotoId_fkey: 'public.InternalNote'
		}
	}
	'public.OrgReview': {
		parent: {
			OrgReview_lcrCountryId_fkey: 'public.Country'
			OrgReview_lcrGovDistId_fkey: 'public.GovDist'
			OrgReview_langId_fkey: 'public.Language'
			OrgReview_orgLocationId_fkey: 'public.OrgLocation'
			OrgReview_orgServiceId_fkey: 'public.OrgService'
			OrgReview_organizationId_fkey: 'public.Organization'
			OrgReview_userId_fkey: 'public.User'
		}
		children: {
			InternalNote_orgReviewId_fkey: 'public.InternalNote'
			TranslatedReview_reviewId_fkey: 'public.TranslatedReview'
		}
	}
	'public.OrgService': {
		parent: {
			OrgService_descriptionId_fkey: 'public.FreeText'
			OrgService_serviceNameId_fkey: 'public.FreeText'
			OrgService_organizationId_fkey: 'public.Organization'
		}
		children: {
			AttributeSupplement_serviceId_fkey: 'public.AttributeSupplement'
			InternalNote_orgServiceId_fkey: 'public.InternalNote'
			OrgHours_orgServiceId_fkey: 'public.OrgHours'
			OrgLocationService_serviceId_fkey: 'public.OrgLocationService'
			OrgReview_orgServiceId_fkey: 'public.OrgReview'
			OrgServiceEmail_serviceId_fkey: 'public.OrgServiceEmail'
			OrgServicePhone_serviceId_fkey: 'public.OrgServicePhone'
			OrgServiceTag_serviceId_fkey: 'public.OrgServiceTag'
			OrgServiceWebsite_serviceId_fkey: 'public.OrgServiceWebsite'
			SavedService_serviceId_fkey: 'public.SavedService'
			ServiceArea_orgServiceId_fkey: 'public.ServiceArea'
		}
	}
	'public.OrgServiceEmail': {
		parent: {
			OrgServiceEmail_orgEmailId_fkey: 'public.OrgEmail'
			OrgServiceEmail_serviceId_fkey: 'public.OrgService'
		}
		children: {}
	}
	'public.OrgServicePhone': {
		parent: {
			OrgServicePhone_orgPhoneId_fkey: 'public.OrgPhone'
			OrgServicePhone_serviceId_fkey: 'public.OrgService'
		}
		children: {}
	}
	'public.OrgServiceTag': {
		parent: {
			OrgServiceTag_serviceId_fkey: 'public.OrgService'
			OrgServiceTag_tagId_fkey: 'public.ServiceTag'
		}
		children: {}
	}
	'public.OrgServiceWebsite': {
		parent: {
			OrgServiceWebsite_serviceId_fkey: 'public.OrgService'
			OrgServiceWebsite_orgWebsiteId_fkey: 'public.OrgWebsite'
		}
		children: {}
	}
	'public.OrgSocialMedia': {
		parent: {
			OrgSocialMedia_organizationId_fkey: 'public.Organization'
			OrgSocialMedia_serviceId_fkey: 'public.SocialMediaService'
		}
		children: {
			InternalNote_orgSocialMediaId_fkey: 'public.InternalNote'
			OrgLocationSocialMedia_socialMediaId_fkey: 'public.OrgLocationSocialMedia'
		}
	}
	'public.OrgWebsite': {
		parent: {
			OrgWebsite_descriptionId_fkey: 'public.FreeText'
			OrgWebsite_organizationId_fkey: 'public.Organization'
		}
		children: {
			InternalNote_orgWebsiteId_fkey: 'public.InternalNote'
			OrgLocationWebsite_orgWebsiteId_fkey: 'public.OrgLocationWebsite'
			OrgServiceWebsite_orgWebsiteId_fkey: 'public.OrgServiceWebsite'
			OrgWebsiteLanguage_orgWebsiteId_fkey: 'public.OrgWebsiteLanguage'
		}
	}
	'public.OrgWebsiteLanguage': {
		parent: {
			OrgWebsiteLanguage_languageId_fkey: 'public.Language'
			OrgWebsiteLanguage_orgWebsiteId_fkey: 'public.OrgWebsite'
		}
		children: {}
	}
	'public.Organization': {
		parent: {
			Organization_descriptionId_fkey: 'public.FreeText'
			Organization_sourceId_fkey: 'public.Source'
		}
		children: {
			AttributeSupplement_organizationId_fkey: 'public.AttributeSupplement'
			InternalNote_organizationId_fkey: 'public.InternalNote'
			OrgHours_organizationId_fkey: 'public.OrgHours'
			OrgLocation_orgId_fkey: 'public.OrgLocation'
			OrgPhoto_orgId_fkey: 'public.OrgPhoto'
			OrgReview_organizationId_fkey: 'public.OrgReview'
			OrgService_organizationId_fkey: 'public.OrgService'
			OrgSocialMedia_organizationId_fkey: 'public.OrgSocialMedia'
			OrgWebsite_organizationId_fkey: 'public.OrgWebsite'
			OrganizationEmail_organizationId_fkey: 'public.OrganizationEmail'
			OrganizationPermission_organizationId_fkey: 'public.OrganizationPermission'
			OrganizationPhone_organizationId_fkey: 'public.OrganizationPhone'
			OutsideAPI_organizationId_fkey: 'public.OutsideAPI'
			SavedOrganization_organizationId_fkey: 'public.SavedOrganization'
			ServiceArea_organizationId_fkey: 'public.ServiceArea'
			SlugRedirect_orgId_fkey: 'public.SlugRedirect'
			Suggestion_organizationId_fkey: 'public.Suggestion'
			UserToOrganization_organizationId_fkey: 'public.UserToOrganization'
		}
	}
	'public.OrganizationEmail': {
		parent: {
			OrganizationEmail_orgEmailId_fkey: 'public.OrgEmail'
			OrganizationEmail_organizationId_fkey: 'public.Organization'
		}
		children: {}
	}
	'public.OrganizationPermission': {
		parent: {
			OrganizationPermission_organizationId_fkey: 'public.Organization'
			OrganizationPermission_permissionId_fkey: 'public.Permission'
			OrganizationPermission_userId_fkey: 'public.User'
		}
		children: {}
	}
	'public.OrganizationPhone': {
		parent: {
			OrganizationPhone_phoneId_fkey: 'public.OrgPhone'
			OrganizationPhone_organizationId_fkey: 'public.Organization'
		}
		children: {}
	}
	'public.OutsideAPI': {
		parent: {
			OutsideAPI_orgLocationId_fkey: 'public.OrgLocation'
			OutsideAPI_organizationId_fkey: 'public.Organization'
			OutsideAPI_serviceName_fkey: 'public.OutsideAPIService'
		}
		children: {
			InternalNote_outsideApiId_fkey: 'public.InternalNote'
		}
	}
	'public.OutsideAPIService': {
		parent: {}
		children: {
			InternalNote_outsideAPIServiceService_fkey: 'public.InternalNote'
			OutsideAPI_serviceName_fkey: 'public.OutsideAPI'
		}
	}
	'public.Permission': {
		parent: {}
		children: {
			InternalNote_permissionId_fkey: 'public.InternalNote'
			LocationPermission_permissionId_fkey: 'public.LocationPermission'
			OrganizationPermission_permissionId_fkey: 'public.OrganizationPermission'
			RolePermission_permissionId_fkey: 'public.RolePermission'
			UserPermission_permissionId_fkey: 'public.UserPermission'
		}
	}
	'public.PhoneType': {
		parent: {
			PhoneType_tsKey_tsNs_fkey: 'public.TranslationKey'
		}
		children: {
			InternalNote_phoneTypeId_fkey: 'public.InternalNote'
			OrgPhone_phoneTypeId_fkey: 'public.OrgPhone'
		}
	}
	'public.RolePermission': {
		parent: {
			RolePermission_permissionId_fkey: 'public.Permission'
			RolePermission_roleId_fkey: 'public.UserRole'
		}
		children: {}
	}
	'public.SavedOrganization': {
		parent: {
			SavedOrganization_organizationId_fkey: 'public.Organization'
			SavedOrganization_listId_fkey: 'public.UserSavedList'
		}
		children: {}
	}
	'public.SavedService': {
		parent: {
			SavedService_serviceId_fkey: 'public.OrgService'
			SavedService_listId_fkey: 'public.UserSavedList'
		}
		children: {}
	}
	'public.ServiceArea': {
		parent: {
			ServiceArea_orgLocationId_fkey: 'public.OrgLocation'
			ServiceArea_orgServiceId_fkey: 'public.OrgService'
			ServiceArea_organizationId_fkey: 'public.Organization'
		}
		children: {
			ServiceAreaCountry_serviceAreaId_fkey: 'public.ServiceAreaCountry'
			ServiceAreaDist_serviceAreaId_fkey: 'public.ServiceAreaDist'
		}
	}
	'public.ServiceAreaCountry': {
		parent: {
			ServiceAreaCountry_countryId_fkey: 'public.Country'
			ServiceAreaCountry_serviceAreaId_fkey: 'public.ServiceArea'
		}
		children: {}
	}
	'public.ServiceAreaDist': {
		parent: {
			ServiceAreaDist_govDistId_fkey: 'public.GovDist'
			ServiceAreaDist_serviceAreaId_fkey: 'public.ServiceArea'
		}
		children: {}
	}
	'public.ServiceCategory': {
		parent: {
			ServiceCategory_tsKey_tsNs_fkey: 'public.TranslationKey'
		}
		children: {
			InternalNote_serviceCategoryId_fkey: 'public.InternalNote'
			ServiceCategoryDefaultAttribute_categoryId_fkey: 'public.ServiceCategoryDefaultAttribute'
			ServiceTag_primaryCategoryId_fkey: 'public.ServiceTag'
			ServiceTagToCategory_categoryId_fkey: 'public.ServiceTagToCategory'
		}
	}
	'public.ServiceCategoryDefaultAttribute': {
		parent: {
			ServiceCategoryDefaultAttribute_attributeId_fkey: 'public.Attribute'
			ServiceCategoryDefaultAttribute_categoryId_fkey: 'public.ServiceCategory'
		}
		children: {}
	}
	'public.ServiceTag': {
		parent: {
			ServiceTag_primaryCategoryId_fkey: 'public.ServiceCategory'
			ServiceTag_tsKey_tsNs_fkey: 'public.TranslationKey'
		}
		children: {
			InternalNote_serviceTagId_fkey: 'public.InternalNote'
			OrgServiceTag_tagId_fkey: 'public.OrgServiceTag'
			ServiceTagCountry_serviceId_fkey: 'public.ServiceTagCountry'
			ServiceTagDefaultAttribute_serviceId_fkey: 'public.ServiceTagDefaultAttribute'
			ServiceTagNesting_childId_fkey: 'public.ServiceTagNesting'
			ServiceTagNesting_parentId_fkey: 'public.ServiceTagNesting'
			ServiceTagToCategory_serviceTagId_fkey: 'public.ServiceTagToCategory'
		}
	}
	'public.ServiceTagCountry': {
		parent: {
			ServiceTagCountry_countryId_fkey: 'public.Country'
			ServiceTagCountry_serviceId_fkey: 'public.ServiceTag'
		}
		children: {}
	}
	'public.ServiceTagDefaultAttribute': {
		parent: {
			ServiceTagDefaultAttribute_attributeId_fkey: 'public.Attribute'
			ServiceTagDefaultAttribute_serviceId_fkey: 'public.ServiceTag'
		}
		children: {}
	}
	'public.ServiceTagNesting': {
		parent: {
			ServiceTagNesting_childId_fkey: 'public.ServiceTag'
			ServiceTagNesting_parentId_fkey: 'public.ServiceTag'
		}
		children: {}
	}
	'public.ServiceTagToCategory': {
		parent: {
			ServiceTagToCategory_categoryId_fkey: 'public.ServiceCategory'
			ServiceTagToCategory_serviceTagId_fkey: 'public.ServiceTag'
		}
		children: {}
	}
	'public.Session': {
		parent: {
			Session_userId_fkey: 'public.User'
		}
		children: {}
	}
	'public.SlugRedirect': {
		parent: {
			SlugRedirect_orgId_fkey: 'public.Organization'
		}
		children: {}
	}
	'public.SocialMediaLink': {
		parent: {
			SocialMediaLink_serviceId_fkey: 'public.SocialMediaService'
		}
		children: {
			InternalNote_socialMediaLinkId_fkey: 'public.InternalNote'
		}
	}
	'public.SocialMediaService': {
		parent: {
			SocialMediaService_tsKey_tsNs_fkey: 'public.TranslationKey'
		}
		children: {
			InternalNote_socialMediaServiceId_fkey: 'public.InternalNote'
			OrgSocialMedia_serviceId_fkey: 'public.OrgSocialMedia'
			SocialMediaLink_serviceId_fkey: 'public.SocialMediaLink'
		}
	}
	'public.Source': {
		parent: {}
		children: {
			InternalNote_sourceId_fkey: 'public.InternalNote'
			Organization_sourceId_fkey: 'public.Organization'
			User_sourceId_fkey: 'public.User'
		}
	}
	'public.Suggestion': {
		parent: {
			Suggestion_organizationId_fkey: 'public.Organization'
		}
		children: {
			InternalNote_suggestionId_fkey: 'public.InternalNote'
		}
	}
	'public.SurveyCommunity': {
		parent: {
			SurveyCommunity_communityId_fkey: 'public.UserCommunity'
			SurveyCommunity_surveyId_fkey: 'public.UserSurvey'
		}
		children: {}
	}
	'public.SurveyEthnicity': {
		parent: {
			SurveyEthnicity_ethnicityId_fkey: 'public.UserEthnicity'
			SurveyEthnicity_surveyId_fkey: 'public.UserSurvey'
		}
		children: {}
	}
	'public.SurveySOG': {
		parent: {
			SurveySOG_sogId_fkey: 'public.UserSOGIdentity'
			SurveySOG_surveyId_fkey: 'public.UserSurvey'
		}
		children: {}
	}
	'public.TranslatedReview': {
		parent: {
			TranslatedReview_languageId_fkey: 'public.Language'
			TranslatedReview_reviewId_fkey: 'public.OrgReview'
		}
		children: {}
	}
	'public.TranslationKey': {
		parent: {
			TranslationKey_ns_fkey: 'public.TranslationNamespace'
		}
		children: {
			Attribute_tsKey_tsNs_fkey: 'public.Attribute'
			Country_demonymKey_demonymNs_fkey: 'public.Country'
			Country_tsKey_tsNs_fkey: 'public.Country'
			FreeText_key_ns_fkey: 'public.FreeText'
			GovDist_tsKey_tsNs_fkey: 'public.GovDist'
			GovDistType_tsKey_tsNs_fkey: 'public.GovDistType'
			InternalNote_translationKey_translationNs_fkey: 'public.InternalNote'
			PhoneType_tsKey_tsNs_fkey: 'public.PhoneType'
			ServiceCategory_tsKey_tsNs_fkey: 'public.ServiceCategory'
			ServiceTag_tsKey_tsNs_fkey: 'public.ServiceTag'
			SocialMediaService_tsKey_tsNs_fkey: 'public.SocialMediaService'
			UserCommunity_tsKey_tsNs_fkey: 'public.UserCommunity'
			UserEthnicity_tsKey_tsNs_fkey: 'public.UserEthnicity'
			UserImmigration_tsKey_tsNs_fkey: 'public.UserImmigration'
			UserSOGIdentity_tsKey_tsNs_fkey: 'public.UserSOGIdentity'
			UserTitle_tsKey_tsNs_fkey: 'public.UserTitle'
			UserType_tsKey_tsNs_fkey: 'public.UserType'
		}
	}
	'public.TranslationNamespace': {
		parent: {}
		children: {
			AttributeCategory_ns_fkey: 'public.AttributeCategory'
			InternalNote_translationNamespaceName_fkey: 'public.InternalNote'
			TranslationKey_ns_fkey: 'public.TranslationKey'
		}
	}
	'public.User': {
		parent: {
			User_currentCountryId_fkey: 'public.Country'
			User_currentGovDistId_fkey: 'public.GovDist'
			User_langPrefId_fkey: 'public.Language'
			User_sourceId_fkey: 'public.Source'
			User_userTypeId_fkey: 'public.UserType'
		}
		children: {
			Account_userId_fkey: 'public.Account'
			AssignedRole_userId_fkey: 'public.AssignedRole'
			AttributeSupplement_userId_fkey: 'public.AttributeSupplement'
			FieldVisibility_userId_fkey: 'public.FieldVisibility'
			ListSharedWith_userId_fkey: 'public.ListSharedWith'
			LocationPermission_userId_fkey: 'public.LocationPermission'
			OrgReview_userId_fkey: 'public.OrgReview'
			OrganizationPermission_userId_fkey: 'public.OrganizationPermission'
			Session_userId_fkey: 'public.Session'
			UserCommunityLink_userId_fkey: 'public.UserCommunityLink'
			UserMail_fromUserId_fkey: 'public.UserMail'
			UserMail_toUserId_fkey: 'public.UserMail'
			UserPermission_userId_fkey: 'public.UserPermission'
			UserSOGLink_userId_fkey: 'public.UserSOGLink'
			UserSavedList_ownedById_fkey: 'public.UserSavedList'
			UserToOrganization_userId_fkey: 'public.UserToOrganization'
		}
	}
	'public.UserCommunity': {
		parent: {
			UserCommunity_tsKey_tsNs_fkey: 'public.TranslationKey'
		}
		children: {
			SurveyCommunity_communityId_fkey: 'public.SurveyCommunity'
			UserCommunityLink_communityId_fkey: 'public.UserCommunityLink'
		}
	}
	'public.UserCommunityLink': {
		parent: {
			UserCommunityLink_userId_fkey: 'public.User'
			UserCommunityLink_communityId_fkey: 'public.UserCommunity'
		}
		children: {}
	}
	'public.UserEthnicity': {
		parent: {
			UserEthnicity_tsKey_tsNs_fkey: 'public.TranslationKey'
		}
		children: {
			SurveyEthnicity_ethnicityId_fkey: 'public.SurveyEthnicity'
		}
	}
	'public.UserImmigration': {
		parent: {
			UserImmigration_tsKey_tsNs_fkey: 'public.TranslationKey'
		}
		children: {
			UserSurvey_immigrationId_fkey: 'public.UserSurvey'
		}
	}
	'public.UserMail': {
		parent: {
			UserMail_fromUserId_fkey: 'public.User'
			UserMail_toUserId_fkey: 'public.User'
			UserMail_responseToId_fkey: 'public.UserMail'
		}
		children: {
			UserMail_responseToId_fkey: 'public.UserMail'
		}
	}
	'public.UserPermission': {
		parent: {
			UserPermission_permissionId_fkey: 'public.Permission'
			UserPermission_userId_fkey: 'public.User'
		}
		children: {}
	}
	'public.UserRole': {
		parent: {}
		children: {
			AssignedRole_roleId_fkey: 'public.AssignedRole'
			RolePermission_roleId_fkey: 'public.RolePermission'
		}
	}
	'public.UserSOGIdentity': {
		parent: {
			UserSOGIdentity_tsKey_tsNs_fkey: 'public.TranslationKey'
		}
		children: {
			SurveySOG_sogId_fkey: 'public.SurveySOG'
			UserSOGLink_sogIdentityId_fkey: 'public.UserSOGLink'
		}
	}
	'public.UserSOGLink': {
		parent: {
			UserSOGLink_userId_fkey: 'public.User'
			UserSOGLink_sogIdentityId_fkey: 'public.UserSOGIdentity'
		}
		children: {}
	}
	'public.UserSavedList': {
		parent: {
			UserSavedList_ownedById_fkey: 'public.User'
		}
		children: {
			ListSharedWith_listId_fkey: 'public.ListSharedWith'
			SavedOrganization_listId_fkey: 'public.SavedOrganization'
			SavedService_listId_fkey: 'public.SavedService'
		}
	}
	'public.UserSurvey': {
		parent: {
			UserSurvey_countryOriginId_fkey: 'public.Country'
			UserSurvey_currentCountryId_fkey: 'public.Country'
			UserSurvey_currentGovDistId_fkey: 'public.GovDist'
			UserSurvey_immigrationId_fkey: 'public.UserImmigration'
		}
		children: {
			SurveyCommunity_surveyId_fkey: 'public.SurveyCommunity'
			SurveyEthnicity_surveyId_fkey: 'public.SurveyEthnicity'
			SurveySOG_surveyId_fkey: 'public.SurveySOG'
		}
	}
	'public.UserTitle': {
		parent: {
			UserTitle_tsKey_tsNs_fkey: 'public.TranslationKey'
		}
		children: {
			OrgEmail_titleId_fkey: 'public.OrgEmail'
			UserToOrganization_orgTitleId_fkey: 'public.UserToOrganization'
		}
	}
	'public.UserToOrganization': {
		parent: {
			UserToOrganization_orgEmailId_fkey: 'public.OrgEmail'
			UserToOrganization_orgPhoneId_fkey: 'public.OrgPhone'
			UserToOrganization_organizationId_fkey: 'public.Organization'
			UserToOrganization_userId_fkey: 'public.User'
			UserToOrganization_orgTitleId_fkey: 'public.UserTitle'
		}
		children: {}
	}
	'public.UserType': {
		parent: {
			UserType_tsKey_tsNs_fkey: 'public.TranslationKey'
		}
		children: {
			User_userTypeId_fkey: 'public.User'
		}
	}
}
//#endregion

//#region select
type SelectedTable = { id: string; schema: string; table: string }

type SelectDefault = {
	/**
	 * Define the "default" behavior to use for the tables in the schema. If true, select all tables in the
	 * schema. If false, select no tables in the schema. If "structure", select only the structure of the tables
	 * in the schema but not the data.
	 *
	 * @defaultValue true
	 */
	$default?: SelectObject
}

type DefaultKey = keyof SelectDefault

type SelectObject = boolean | 'structure'

type ExtensionsSelect<TSchema extends keyof Database> = TSchema extends keyof Extension
	? {
			/**
			 * Define if you want to select the extension data.
			 *
			 * @defaultValue false
			 */
			$extensions?:
				| boolean
				| {
						[TExtension in Extension[TSchema]]?: boolean
				  }
		}
	: {}

type SelectConfig = SelectDefault & {
	[TSchema in keyof Database]?:
		| SelectObject
		| (SelectDefault &
				ExtensionsSelect<TSchema> & {
					[TTable in keyof Database[TSchema]]?: SelectObject
				})
}

// Apply the __default key if it exists to each level of the select config (schemas and tables)
type ApplyDefault<TSelectConfig extends SelectConfig> = {
	[TSchema in keyof Database]-?: {
		[TTable in keyof Database[TSchema]]-?: TSelectConfig[TSchema] extends SelectObject
			? TSelectConfig[TSchema]
			: TSelectConfig[TSchema] extends Record<any, any>
				? TSelectConfig[TSchema][TTable] extends SelectObject
					? TSelectConfig[TSchema][TTable]
					: TSelectConfig[TSchema][DefaultKey] extends SelectObject
						? TSelectConfig[TSchema][DefaultKey]
						: TSelectConfig[DefaultKey] extends SelectObject
							? TSelectConfig[DefaultKey]
							: true
				: TSelectConfig[DefaultKey] extends SelectObject
					? TSelectConfig[DefaultKey]
					: true
	}
}

type ExtractValues<T> = T extends object ? T[keyof T] : never

type GetSelectedTable<TSelectSchemas extends SelectConfig> = ExtractValues<
	ExtractValues<{
		[TSchema in keyof TSelectSchemas]: {
			[TTable in keyof TSelectSchemas[TSchema] as TSelectSchemas[TSchema][TTable] extends true
				? TTable
				: never]: TSchema extends string
				? TTable extends string
					? { id: `${TSchema}.${TTable}`; schema: TSchema; table: TTable }
					: never
				: never
		}
	}>
>
//#endregion

//#region transform
type TransformMode = 'auto' | 'strict' | 'unsafe' | undefined

type TransformOptions<TTransformMode extends TransformMode> = {
	/**
	 * The type for defining the transform mode.
	 *
	 * There are three modes available:
	 *
	 * - "auto" - Automatically transform the data for any columns, tables or schemas that have not been specified
	 *   in the config
	 * - "strict" - In this mode, Snaplet expects a transformation to be given in the config for every column in
	 *   the database. If any columns have not been provided in the config, Snaplet will not capture the
	 *   snapshot, but instead tell you which columns, tables, or schemas have not been given
	 * - "unsafe" - This mode copies over values without any transformation. If a transformation is given for a
	 *   column in the config, the transformation will be used instead
	 *
	 * @defaultValue 'unsafe'
	 */
	$mode?: TTransformMode
	/**
	 * If true, parse JSON objects during transformation.
	 *
	 * @defaultValue false
	 */
	$parseJson?: boolean
}

// This type is here to turn a Table with scalars values (string, number, etc..) for columns into a Table
// with either scalar values or a callback function that returns the scalar value
type ColumnWithCallback<TSchema extends keyof Database, TTable extends keyof Database[TSchema]> = {
	[TColumn in keyof Database[TSchema][TTable]]:
		| Database[TSchema][TTable][TColumn]
		| ((ctx: {
				row: Database[TSchema][TTable]
				value: Database[TSchema][TTable][TColumn]
		  }) => Database[TSchema][TTable][TColumn])
}

type DatabaseWithCallback = {
	[TSchema in keyof Database]: {
		[TTable in keyof Database[TSchema]]:
			| ((ctx: { row: Database[TSchema][TTable]; rowIndex: number }) => ColumnWithCallback<TSchema, TTable>)
			| ColumnWithCallback<TSchema, TTable>
	}
}

type SelectDatabase<TSelectedTable extends SelectedTable> = {
	[TSchema in keyof DatabaseWithCallback as TSchema extends NonNullable<TSelectedTable>['schema']
		? TSchema
		: never]: {
		[TTable in keyof DatabaseWithCallback[TSchema] as TTable extends Extract<
			TSelectedTable,
			{ schema: TSchema }
		>['table']
			? TTable
			: never]: DatabaseWithCallback[TSchema][TTable]
	}
}

type PartialTransform<T> = T extends (...args: infer P) => infer R ? (...args: P) => Partial<R> : Partial<T>

type IsNever<T> = [T] extends [never] ? true : false

type TransformConfig<
	TTransformMode extends TransformMode,
	TSelectedTable extends SelectedTable,
> = TransformOptions<TTransformMode> &
	(IsNever<TSelectedTable> extends true
		? never
		: SelectDatabase<TSelectedTable> extends infer TSelectedDatabase
			? TTransformMode extends 'strict'
				? TSelectedDatabase
				: {
						[TSchema in keyof TSelectedDatabase]?: {
							[TTable in keyof TSelectedDatabase[TSchema]]?: PartialTransform<
								TSelectedDatabase[TSchema][TTable]
							>
						}
					}
			: never)
//#endregion

//#region subset
type NonEmptyArray<T> = [T, ...T[]]

/**
 * Represents an exclusive row limit percent.
 */
type ExclusiveRowLimitPercent =
	| {
			percent?: never
			/**
			 * Represents a strict limit of the number of rows captured on target
			 */
			rowLimit: number
	  }
	| {
			/**
			 * Represents a random percent to be captured on target (1-100)
			 */
			percent: number
			rowLimit?: never
	  }

// Get the type of a target in the config.subset.targets array
type SubsetTarget<TSelectedTable extends SelectedTable> = {
	/**
	 * The ID of the table to target
	 */
	table: TSelectedTable['id']
	/**
	 * The order on which your target will be filtered useful with rowLimit parameter
	 *
	 * @example OrderBy: `"User"."createdAt" desc`
	 */
	orderBy?: string
} & (
	| ({
			/**
			 * The where filter to be applied on the target
			 *
			 * @example Where: `"_prisma_migrations"."name" IN ('migration1', 'migration2')`
			 */
			where: string
	  } & Partial<ExclusiveRowLimitPercent>)
	| ({
			/**
			 * The where filter to be applied on the target
			 */
			where?: string
	  } & ExclusiveRowLimitPercent)
)

type GetSelectedTableChildrenKeys<TTable extends keyof Tables_relationships> =
	keyof Tables_relationships[TTable]['children']
type GetSelectedTableParentKeys<TTable extends keyof Tables_relationships> =
	keyof Tables_relationships[TTable]['parent']
type GetSelectedTableRelationsKeys<TTable extends keyof Tables_relationships> =
	| GetSelectedTableChildrenKeys<TTable>
	| GetSelectedTableParentKeys<TTable>
type SelectedTablesWithRelationsIds<TSelectedTable extends SelectedTable['id']> =
	TSelectedTable extends keyof Tables_relationships ? TSelectedTable : never

/**
 * Represents the options to choose the followNullableRelations of subsetting.
 */
type FollowNullableRelationsOptions<TSelectedTable extends SelectedTable> =
	// Type can be a global boolean definition
	| boolean
	// Or can be a mix of $default and table specific definition
	| ({ $default: boolean } & {
			// If it's a table specific definition and the table has relationships
			[TTable in SelectedTablesWithRelationsIds<TSelectedTable['id']>]?:  // It's either a boolean or a mix of $default and relationship specific definition
				| boolean
				| {
						[Key in GetSelectedTableRelationsKeys<TTable> | '$default']?: boolean
				  }
	  })

/**
 * Represents the options to choose the maxCyclesLoop of subsetting.
 */
type MaxCyclesLoopOptions<TSelectedTable extends SelectedTable> =
	// Type can be a global number definition
	| number
	// Or can be a mix of $default and table specific definition
	| ({ $default: number } & {
			// If it's a table specific definition and the table has relationships
			[TTable in SelectedTablesWithRelationsIds<TSelectedTable['id']>]?:  // It's either a number or a mix of $default and relationship specific definition
				| number
				| {
						[Key in GetSelectedTableRelationsKeys<TTable> | '$default']?: number
				  }
	  })

/**
 * Represents the options to choose the maxChildrenPerNode of subsetting.
 */
type MaxChildrenPerNodeOptions<TSelectedTable extends SelectedTable> =
	// Type can be a global number definition
	| number
	// Or can be a mix of $default and table specific definition
	| ({ $default: number } & {
			// If it's a table specific definition and the table has relationships
			[TTable in SelectedTablesWithRelationsIds<TSelectedTable['id']>]?:  // It's either a number or a mix of $default and relationship specific definition
				| number
				| {
						[Key in GetSelectedTableRelationsKeys<TTable> | '$default']?: number
				  }
	  })

/**
 * Represents the configuration for subsetting the snapshot.
 */
type SubsetConfig<TSelectedTable extends SelectedTable> = {
	/**
	 * Specifies whether subsetting is enabled.
	 *
	 * @defaultValue true
	 */
	enabled?: boolean

	/**
	 * Specifies the version of the subsetting algorithm
	 *
	 * @deprecated
	 * @defaultValue '3'
	 */
	version?: '1' | '2' | '3'

	/**
	 * Specifies whether to eagerly load related tables.
	 *
	 * @defaultValue false
	 */
	eager?: boolean

	/**
	 * Specifies whether to keep tables that are not connected to any other tables.
	 *
	 * @defaultValue false
	 */
	keepDisconnectedTables?: boolean

	/**
	 * Specifies whether to follow nullable relations.
	 *
	 * @defaultValue false
	 */
	followNullableRelations?: FollowNullableRelationsOptions<TSelectedTable>

	/**
	 * Specifies the maximum number of children per node.
	 *
	 * @defaultValue unlimited
	 */
	maxChildrenPerNode?: MaxChildrenPerNodeOptions<TSelectedTable>

	/**
	 * Specifies the maximum number of cycles in a loop.
	 *
	 * @defaultValue 10
	 */
	maxCyclesLoop?: MaxCyclesLoopOptions<TSelectedTable>

	/**
	 * Specifies the root targets for subsetting. Must be a non-empty array
	 */
	targets: NonEmptyArray<SubsetTarget<TSelectedTable>>

	/**
	 * Specifies the task sorting algorithm. By default, the algorithm will not sort the tasks.
	 */
	taskSortAlgorithm?: 'children' | 'idsCount'
}
//#endregion

//#region introspect
type VirtualForeignKey<TTFkTable extends SelectedTable, TTargetTable extends SelectedTable> = {
	fkTable: TTFkTable['id']
	targetTable: TTargetTable['id']
	keys: NonEmptyArray<{
		// TODO: Find a way to strongly type this to provide autocomplete when writing the config
		/**
		 * The column name present in the fkTable that is a foreign key to the targetTable
		 */
		fkColumn: string
		/**
		 * The column name present in the targetTable that is a foreign key to the fkTable
		 */
		targetColumn: string
	}>
}

type IntrospectConfig<TSelectedTable extends SelectedTable> = {
	/**
	 * Allows you to declare virtual foreign keys that are not present as foreign keys in the database. But are
	 * still used and enforced by the application.
	 */
	virtualForeignKeys?: Array<VirtualForeignKey<TSelectedTable, TSelectedTable>>
}
//#endregion

type Validate<T, Target> = {
	[K in keyof T]: K extends keyof Target ? T[K] : never
}

type TypedConfig<TSelectConfig extends SelectConfig, TTransformMode extends TransformMode> =
	GetSelectedTable<ApplyDefault<TSelectConfig>> extends SelectedTable
		? {
				/**
				 * Parameter to configure the generation of data. {@link https://docs.snaplet.dev/core-concepts/seed}
				 */
				seed?: {
					alias?: import('./snaplet-client').Alias
					fingerprint?: import('./snaplet-client').Fingerprint
				}
				/**
				 * Parameter to configure the inclusion/exclusion of schemas and tables from the snapshot.
				 * {@link https://docs.snaplet.dev/reference/configuration#select}
				 */
				select?: Validate<TSelectConfig, SelectConfig>
				/**
				 * Parameter to configure the transformations applied to the data.
				 * {@link https://docs.snaplet.dev/reference/configuration#transform}
				 */
				transform?: TransformConfig<TTransformMode, GetSelectedTable<ApplyDefault<TSelectConfig>>>
				/**
				 * Parameter to capture a subset of the data.
				 * {@link https://docs.snaplet.dev/reference/configuration#subset}
				 */
				subset?: SubsetConfig<GetSelectedTable<ApplyDefault<TSelectConfig>>>

				/**
				 * Parameter to augment the result of the introspection of your database.
				 * {@link https://docs.snaplet.dev/references/data-operations/introspect}
				 */
				introspect?: IntrospectConfig<GetSelectedTable<ApplyDefault<TSelectConfig>>>
			}
		: never

declare module 'snaplet' {
	class JsonNull {}
	type JsonClass = typeof JsonNull
	/**
	 * Use this value to explicitely set a json or jsonb column to json null instead of the database NULL value.
	 */
	export const jsonNull: InstanceType<JsonClass>
	/**
	 * Define the configuration for Snaplet capture process.
	 * {@link https://docs.snaplet.dev/reference/configuration}
	 */
	export function defineConfig<
		TSelectConfig extends SelectConfig,
		TTransformMode extends TransformMode = undefined,
	>(config: TypedConfig<TSelectConfig, TTransformMode>): TypedConfig<TSelectConfig, TTransformMode>
}
