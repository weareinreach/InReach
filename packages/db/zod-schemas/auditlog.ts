import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AccountModel,
	AttributeCategoryModel,
	AttributeModel,
	AttributeSupplementModel,
	CompleteAccount,
	CompleteAttribute,
	CompleteAttributeCategory,
	CompleteAttributeSupplement,
	CompleteCountry,
	CompleteFieldVisibility,
	CompleteFooterLink,
	CompleteGovDist,
	CompleteGovDistType,
	CompleteInternalNote,
	CompleteLanguage,
	CompleteNavigation,
	CompleteOrgDescription,
	CompleteOrgEmail,
	CompleteOrgHours,
	CompleteOrgLocation,
	CompleteOrgPhone,
	CompleteOrgPhoto,
	CompleteOrgReview,
	CompleteOrgService,
	CompleteOrgSocialMedia,
	CompleteOrganization,
	CompleteOutsideAPI,
	CompletePermissionAsset,
	CompletePermissionItem,
	CompletePhoneType,
	CompleteServiceCategory,
	CompleteServiceTag,
	CompleteSocialMediaLink,
	CompleteSocialMediaService,
	CompleteSource,
	CompleteTranslationKey,
	CompleteTranslationNamespace,
	CompleteUser,
	CompleteUserCommunity,
	CompleteUserEthnicity,
	CompleteUserImmigration,
	CompleteUserMail,
	CompleteUserRole,
	CompleteUserSOGIdentity,
	CompleteUserSavedList,
	CompleteUserTitle,
	CompleteUserType,
	CountryModel,
	FieldVisibilityModel,
	FooterLinkModel,
	GovDistModel,
	GovDistTypeModel,
	InternalNoteModel,
	LanguageModel,
	NavigationModel,
	OrgDescriptionModel,
	OrgEmailModel,
	OrgHoursModel,
	OrgLocationModel,
	OrgPhoneModel,
	OrgPhotoModel,
	OrgReviewModel,
	OrgServiceModel,
	OrgSocialMediaModel,
	OrganizationModel,
	OutsideAPIModel,
	PermissionAssetModel,
	PermissionItemModel,
	PhoneTypeModel,
	ServiceCategoryModel,
	ServiceTagModel,
	SocialMediaLinkModel,
	SocialMediaServiceModel,
	SourceModel,
	TranslationKeyModel,
	TranslationNamespaceModel,
	UserCommunityModel,
	UserEthnicityModel,
	UserImmigrationModel,
	UserMailModel,
	UserModel,
	UserRoleModel,
	UserSOGIdentityModel,
	UserSavedListModel,
	UserTitleModel,
	UserTypeModel,
} from './index'

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
	z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
)

export const _AuditLogModel = z.object({
	id: imports.cuid,
	actorId: imports.cuid,
	timestamp: z.date(),
	from: jsonSchema,
	to: jsonSchema,
	accountId: imports.cuid.nullish(),
	attributeId: imports.cuid.nullish(),
	attributeCategoryId: imports.cuid.nullish(),
	attributeSupplementId: imports.cuid.nullish(),
	countryId: imports.cuid.nullish(),
	fieldVisibilityId: imports.cuid.nullish(),
	footerLinkId: imports.cuid.nullish(),
	govDistId: imports.cuid.nullish(),
	govDistTypeId: imports.cuid.nullish(),
	internalNoteId: imports.cuid.nullish(),
	languageId: imports.cuid.nullish(),
	navigationId: imports.cuid.nullish(),
	organizationId: imports.cuid.nullish(),
	orgDescriptionId: imports.cuid.nullish(),
	orgEmailId: imports.cuid.nullish(),
	orgHoursId: imports.cuid.nullish(),
	orgLocationId: imports.cuid.nullish(),
	orgPhoneId: imports.cuid.nullish(),
	orgPhotoId: imports.cuid.nullish(),
	orgReviewId: imports.cuid.nullish(),
	orgServiceId: imports.cuid.nullish(),
	orgSocialMediaId: imports.cuid.nullish(),
	outsideAPIId: imports.cuid.nullish(),
	permissionAssetId: imports.cuid.nullish(),
	permissionItemId: imports.cuid.nullish(),
	phoneTypeId: imports.cuid.nullish(),
	serviceCategoryId: imports.cuid.nullish(),
	serviceTagId: imports.cuid.nullish(),
	socialMediaLinkId: imports.cuid.nullish(),
	socialMediaServiceId: imports.cuid.nullish(),
	sourceId: imports.cuid.nullish(),
	translationKeyId: imports.cuid.nullish(),
	translationNamespaceId: imports.cuid.nullish(),
	userId: imports.cuid.nullish(),
	userCommunityId: imports.cuid.nullish(),
	userEthnicityId: imports.cuid.nullish(),
	userImmigrationId: imports.cuid.nullish(),
	userMailId: imports.cuid.nullish(),
	userRoleId: imports.cuid.nullish(),
	userSavedListId: imports.cuid.nullish(),
	userSOGIdentityId: imports.cuid.nullish(),
	userTitleId: imports.cuid.nullish(),
	userTypeId: imports.cuid.nullish(),
})

export interface CompleteAuditLog extends z.infer<typeof _AuditLogModel> {
	actor: CompleteUser
	Account?: CompleteAccount | null
	Attribute?: CompleteAttribute | null
	AttributeCategory?: CompleteAttributeCategory | null
	AttributeSupplement?: CompleteAttributeSupplement | null
	Country?: CompleteCountry | null
	FieldVisibility?: CompleteFieldVisibility | null
	FooterLink?: CompleteFooterLink | null
	GovDist?: CompleteGovDist | null
	GovDistType?: CompleteGovDistType | null
	InternalNote?: CompleteInternalNote | null
	Language?: CompleteLanguage | null
	Navigation?: CompleteNavigation | null
	Organization?: CompleteOrganization | null
	OrgDescription?: CompleteOrgDescription | null
	OrgEmail?: CompleteOrgEmail | null
	OrgHours?: CompleteOrgHours | null
	OrgLocation?: CompleteOrgLocation | null
	OrgPhone?: CompleteOrgPhone | null
	OrgPhoto?: CompleteOrgPhoto | null
	OrgReview?: CompleteOrgReview | null
	OrgService?: CompleteOrgService | null
	OrgSocialMedia?: CompleteOrgSocialMedia | null
	OutsideAPI?: CompleteOutsideAPI | null
	PermissionAsset?: CompletePermissionAsset | null
	PermissionItem?: CompletePermissionItem | null
	PhoneType?: CompletePhoneType | null
	ServiceCategory?: CompleteServiceCategory | null
	ServiceTag?: CompleteServiceTag | null
	SocialMediaLink?: CompleteSocialMediaLink | null
	SocialMediaService?: CompleteSocialMediaService | null
	Source?: CompleteSource | null
	TranslationKey?: CompleteTranslationKey | null
	TranslationNamespace?: CompleteTranslationNamespace | null
	User: CompleteUser[]
	UserCommunity?: CompleteUserCommunity | null
	UserEthnicity?: CompleteUserEthnicity | null
	UserImmigration?: CompleteUserImmigration | null
	UserMail?: CompleteUserMail | null
	UserRole?: CompleteUserRole | null
	UserSavedList?: CompleteUserSavedList | null
	UserSOGIdentity?: CompleteUserSOGIdentity | null
	UserTitle?: CompleteUserTitle | null
	UserType?: CompleteUserType | null
}

/**
 * AuditLogModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const AuditLogModel: z.ZodSchema<CompleteAuditLog> = z.lazy(() =>
	_AuditLogModel.extend({
		actor: UserModel,
		Account: AccountModel.nullish(),
		Attribute: AttributeModel.nullish(),
		AttributeCategory: AttributeCategoryModel.nullish(),
		AttributeSupplement: AttributeSupplementModel.nullish(),
		Country: CountryModel.nullish(),
		FieldVisibility: FieldVisibilityModel.nullish(),
		FooterLink: FooterLinkModel.nullish(),
		GovDist: GovDistModel.nullish(),
		GovDistType: GovDistTypeModel.nullish(),
		InternalNote: InternalNoteModel.nullish(),
		Language: LanguageModel.nullish(),
		Navigation: NavigationModel.nullish(),
		Organization: OrganizationModel.nullish(),
		OrgDescription: OrgDescriptionModel.nullish(),
		OrgEmail: OrgEmailModel.nullish(),
		OrgHours: OrgHoursModel.nullish(),
		OrgLocation: OrgLocationModel.nullish(),
		OrgPhone: OrgPhoneModel.nullish(),
		OrgPhoto: OrgPhotoModel.nullish(),
		OrgReview: OrgReviewModel.nullish(),
		OrgService: OrgServiceModel.nullish(),
		OrgSocialMedia: OrgSocialMediaModel.nullish(),
		OutsideAPI: OutsideAPIModel.nullish(),
		PermissionAsset: PermissionAssetModel.nullish(),
		PermissionItem: PermissionItemModel.nullish(),
		PhoneType: PhoneTypeModel.nullish(),
		ServiceCategory: ServiceCategoryModel.nullish(),
		ServiceTag: ServiceTagModel.nullish(),
		SocialMediaLink: SocialMediaLinkModel.nullish(),
		SocialMediaService: SocialMediaServiceModel.nullish(),
		Source: SourceModel.nullish(),
		TranslationKey: TranslationKeyModel.nullish(),
		TranslationNamespace: TranslationNamespaceModel.nullish(),
		User: UserModel.array(),
		UserCommunity: UserCommunityModel.nullish(),
		UserEthnicity: UserEthnicityModel.nullish(),
		UserImmigration: UserImmigrationModel.nullish(),
		UserMail: UserMailModel.nullish(),
		UserRole: UserRoleModel.nullish(),
		UserSavedList: UserSavedListModel.nullish(),
		UserSOGIdentity: UserSOGIdentityModel.nullish(),
		UserTitle: UserTitleModel.nullish(),
		UserType: UserTypeModel.nullish(),
	})
)
