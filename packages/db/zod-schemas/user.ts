import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AccountModel,
	AttributeCategoryModel,
	AttributeModel,
	CompleteAccount,
	CompleteAttribute,
	CompleteAttributeCategory,
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
	CompleteSession,
	CompleteSocialMediaLink,
	CompleteSocialMediaService,
	CompleteSource,
	CompleteTranslationKey,
	CompleteTranslationNamespace,
	CompleteUserCommunity,
	CompleteUserEthnicity,
	CompleteUserImmigration,
	CompleteUserRole,
	CompleteUserSOG,
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
	SessionModel,
	SocialMediaLinkModel,
	SocialMediaServiceModel,
	SourceModel,
	TranslationKeyModel,
	TranslationNamespaceModel,
	UserCommunityModel,
	UserEthnicityModel,
	UserImmigrationModel,
	UserRoleModel,
	UserSOGModel,
	UserSavedListModel,
	UserTitleModel,
	UserTypeModel,
} from './index'

export const _UserModel = z.object({
	id: imports.cuid,
	name: z.string().nullish(),
	email: z.string(),
	emailVerified: z.date().nullish(),
	image: z.string().nullish(),
	legacyId: z.string().nullish(),
	birthYear: z.number().int().nullish(),
	reasonForJoin: z.string().nullish(),
	currentCity: z.string().nullish(),
	currentGovDistId: imports.cuid.nullish(),
	currentCountryId: imports.cuid.nullish(),
	legacyHash: z.string().nullish(),
	legacySalt: z.string().nullish(),
	migrateDate: z.date().nullish(),
	immigrationId: imports.cuid.nullish(),
	roleId: imports.cuid,
	userTypeId: imports.cuid,
	langPrefId: imports.cuid,
	sourceId: imports.cuid.nullish(),
	associatedOrgId: imports.cuid.nullish(),
	orgTitleId: imports.cuid.nullish(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteUser extends z.infer<typeof _UserModel> {
	accounts: CompleteAccount[]
	sessions: CompleteSession[]
	ethnicity: CompleteUserEthnicity[]
	countryOrigin: CompleteCountry[]
	SOG: CompleteUserSOG[]
	communities: CompleteUserCommunity[]
	permissions: CompletePermissionItem[]
	PermissionAsset: CompletePermissionAsset[]
	currentGovDist?: CompleteGovDist | null
	currentCountry?: CompleteCountry | null
	lists: CompleteUserSavedList[]
	sharedLists: CompleteUserSavedList[]
	immigration?: CompleteUserImmigration | null
	role: CompleteUserRole
	userType: CompleteUserType
	langPref: CompleteLanguage
	source?: CompleteSource | null
	associatedOrg?: CompleteOrganization | null
	orgTitle?: CompleteUserTitle | null
	orgEmail?: CompleteOrgEmail | null
	orgPhone?: CompleteOrgPhone | null
	FieldVisibility: CompleteFieldVisibility[]
	createUserEthnicity: CompleteUserEthnicity[]
	updateUserEthnicity: CompleteUserEthnicity[]
	createUserImmigration: CompleteUserImmigration[]
	updateUserImmigration: CompleteUserImmigration[]
	createUserSOG: CompleteUserSOG[]
	updateUserSOG: CompleteUserSOG[]
	createUserType: CompleteUserType[]
	updateUserType: CompleteUserType[]
	createUserCommunity: CompleteUserCommunity[]
	updateUserCommunity: CompleteUserCommunity[]
	createOrganization: CompleteOrganization[]
	updateOrganization: CompleteOrganization[]
	createOrgDescription: CompleteOrgDescription[]
	updateOrgDescription: CompleteOrgDescription[]
	createOrgEmail: CompleteOrgEmail[]
	updateOrgEmail: CompleteOrgEmail[]
	createUserTitle: CompleteUserTitle[]
	updateUserTitle: CompleteUserTitle[]
	createOrgLocation: CompleteOrgLocation[]
	updateOrgLocation: CompleteOrgLocation[]
	createInternalNote: CompleteInternalNote[]
	updateInternalNote: CompleteInternalNote[]
	createOrgPhone: CompleteOrgPhone[]
	updateOrgPhone: CompleteOrgPhone[]
	createOrgPhoto: CompleteOrgPhoto[]
	updateOrgPhoto: CompleteOrgPhoto[]
	createPhoneType: CompletePhoneType[]
	updatePhoneType: CompletePhoneType[]
	createOrgHours: CompleteOrgHours[]
	updateOrgHours: CompleteOrgHours[]
	createOrgService: CompleteOrgService[]
	updateOrgService: CompleteOrgService[]
	createOrgReview: CompleteOrgReview[]
	updateOrgReview: CompleteOrgReview[]
	createServiceCategory: CompleteServiceCategory[]
	updateServiceCategory: CompleteServiceCategory[]
	createServiceTag: CompleteServiceTag[]
	updateServiceTag: CompleteServiceTag[]
	createOrgSocialMedia: CompleteOrgSocialMedia[]
	updateOrgSocialMedia: CompleteOrgSocialMedia[]
	createSource: CompleteSource[]
	updateSource: CompleteSource[]
	createCountry: CompleteCountry[]
	updateCountry: CompleteCountry[]
	createGovDist: CompleteGovDist[]
	updateGovDist: CompleteGovDist[]
	createLanguage: CompleteLanguage[]
	updateLanguage: CompleteLanguage[]
	createTranslationNamespace: CompleteTranslationNamespace[]
	updateTranslationNamespace: CompleteTranslationNamespace[]
	createTranslationKey: CompleteTranslationKey[]
	updateTranslationKey: CompleteTranslationKey[]
	createSocialMediaService: CompleteSocialMediaService[]
	updateSocialMediaService: CompleteSocialMediaService[]
	createUserRole: CompleteUserRole[]
	updateUserRole: CompleteUserRole[]
	createPermissionItem: CompletePermissionItem[]
	updatePermissionItem: CompletePermissionItem[]
	createOutsideAPI: CompleteOutsideAPI[]
	updateOutsideAPI: CompleteOutsideAPI[]
	createGovDistType: CompleteGovDistType[]
	updateGovDistType: CompleteGovDistType[]
	createNavigation: CompleteNavigation[]
	updateNavigation: CompleteNavigation[]
	createFooterLink: CompleteFooterLink[]
	updateFooterLink: CompleteFooterLink[]
	createSocialMediaLink: CompleteSocialMediaLink[]
	updateSocialMediaLink: CompleteSocialMediaLink[]
	createAttributeCategory: CompleteAttributeCategory[]
	updateAttributeCategory: CompleteAttributeCategory[]
	createAttribute: CompleteAttribute[]
	updateAttribute: CompleteAttribute[]
}

/**
 * UserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserModel: z.ZodSchema<CompleteUser> = z.lazy(() =>
	_UserModel.extend({
		accounts: AccountModel.array(),
		sessions: SessionModel.array(),
		ethnicity: UserEthnicityModel.array(),
		countryOrigin: CountryModel.array(),
		SOG: UserSOGModel.array(),
		communities: UserCommunityModel.array(),
		permissions: PermissionItemModel.array(),
		/** Assets that certain permissible roles are attributed to (edit org, etc) */
		PermissionAsset: PermissionAssetModel.array(),
		currentGovDist: GovDistModel.nullish(),
		currentCountry: CountryModel.nullish(),
		lists: UserSavedListModel.array(),
		sharedLists: UserSavedListModel.array(),
		immigration: UserImmigrationModel.nullish(),
		role: UserRoleModel,
		userType: UserTypeModel,
		langPref: LanguageModel,
		source: SourceModel.nullish(),
		associatedOrg: OrganizationModel.nullish(),
		orgTitle: UserTitleModel.nullish(),
		orgEmail: OrgEmailModel.nullish(),
		orgPhone: OrgPhoneModel.nullish(),
		/** For user profile page. All fields default to 'NONE' */
		FieldVisibility: FieldVisibilityModel.array(),
		createUserEthnicity: UserEthnicityModel.array(),
		updateUserEthnicity: UserEthnicityModel.array(),
		createUserImmigration: UserImmigrationModel.array(),
		updateUserImmigration: UserImmigrationModel.array(),
		createUserSOG: UserSOGModel.array(),
		updateUserSOG: UserSOGModel.array(),
		createUserType: UserTypeModel.array(),
		updateUserType: UserTypeModel.array(),
		createUserCommunity: UserCommunityModel.array(),
		updateUserCommunity: UserCommunityModel.array(),
		createOrganization: OrganizationModel.array(),
		updateOrganization: OrganizationModel.array(),
		createOrgDescription: OrgDescriptionModel.array(),
		updateOrgDescription: OrgDescriptionModel.array(),
		createOrgEmail: OrgEmailModel.array(),
		updateOrgEmail: OrgEmailModel.array(),
		createUserTitle: UserTitleModel.array(),
		updateUserTitle: UserTitleModel.array(),
		createOrgLocation: OrgLocationModel.array(),
		updateOrgLocation: OrgLocationModel.array(),
		createInternalNote: InternalNoteModel.array(),
		updateInternalNote: InternalNoteModel.array(),
		createOrgPhone: OrgPhoneModel.array(),
		updateOrgPhone: OrgPhoneModel.array(),
		createOrgPhoto: OrgPhotoModel.array(),
		updateOrgPhoto: OrgPhotoModel.array(),
		createPhoneType: PhoneTypeModel.array(),
		updatePhoneType: PhoneTypeModel.array(),
		createOrgHours: OrgHoursModel.array(),
		updateOrgHours: OrgHoursModel.array(),
		createOrgService: OrgServiceModel.array(),
		updateOrgService: OrgServiceModel.array(),
		createOrgReview: OrgReviewModel.array(),
		updateOrgReview: OrgReviewModel.array(),
		createServiceCategory: ServiceCategoryModel.array(),
		updateServiceCategory: ServiceCategoryModel.array(),
		createServiceTag: ServiceTagModel.array(),
		updateServiceTag: ServiceTagModel.array(),
		createOrgSocialMedia: OrgSocialMediaModel.array(),
		updateOrgSocialMedia: OrgSocialMediaModel.array(),
		createSource: SourceModel.array(),
		updateSource: SourceModel.array(),
		createCountry: CountryModel.array(),
		updateCountry: CountryModel.array(),
		createGovDist: GovDistModel.array(),
		updateGovDist: GovDistModel.array(),
		createLanguage: LanguageModel.array(),
		updateLanguage: LanguageModel.array(),
		createTranslationNamespace: TranslationNamespaceModel.array(),
		updateTranslationNamespace: TranslationNamespaceModel.array(),
		createTranslationKey: TranslationKeyModel.array(),
		updateTranslationKey: TranslationKeyModel.array(),
		createSocialMediaService: SocialMediaServiceModel.array(),
		updateSocialMediaService: SocialMediaServiceModel.array(),
		createUserRole: UserRoleModel.array(),
		updateUserRole: UserRoleModel.array(),
		createPermissionItem: PermissionItemModel.array(),
		updatePermissionItem: PermissionItemModel.array(),
		createOutsideAPI: OutsideAPIModel.array(),
		updateOutsideAPI: OutsideAPIModel.array(),
		createGovDistType: GovDistTypeModel.array(),
		updateGovDistType: GovDistTypeModel.array(),
		createNavigation: NavigationModel.array(),
		updateNavigation: NavigationModel.array(),
		createFooterLink: FooterLinkModel.array(),
		updateFooterLink: FooterLinkModel.array(),
		createSocialMediaLink: SocialMediaLinkModel.array(),
		updateSocialMediaLink: SocialMediaLinkModel.array(),
		createAttributeCategory: AttributeCategoryModel.array(),
		updateAttributeCategory: AttributeCategoryModel.array(),
		createAttribute: AttributeModel.array(),
		updateAttribute: AttributeModel.array(),
	})
)
