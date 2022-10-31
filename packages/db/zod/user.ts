import * as z from 'zod'

import {
	AccountModel,
	CompleteAccount,
	CompleteCountry,
	CompleteCountryTranslation,
	CompleteGovDist,
	CompleteLanguage,
	CompleteOrgDescription,
	CompleteOrgEmail,
	CompleteOrgHours,
	CompleteOrgLocation,
	CompleteOrgNotes,
	CompleteOrgPhone,
	CompleteOrgPhotos,
	CompleteOrgReview,
	CompleteOrgService,
	CompleteOrgSocialMedia,
	CompleteOrgSource,
	CompleteOrganization,
	CompletePhoneType,
	CompleteServiceCategory,
	CompleteServiceType,
	CompleteSession,
	CompleteSocialMediaService,
	CompleteTranslation,
	CompleteTranslationCategory,
	CompleteTranslationItem,
	CompleteTranslationVariable,
	CompleteUserCommunity,
	CompleteUserEthnicity,
	CompleteUserImmigration,
	CompleteUserList,
	CompleteUserPermission,
	CompleteUserRole,
	CompleteUserSOG,
	CompleteUserTitle,
	CompleteUserType,
	CountryModel,
	CountryTranslationModel,
	GovDistModel,
	LanguageModel,
	OrgDescriptionModel,
	OrgEmailModel,
	OrgHoursModel,
	OrgLocationModel,
	OrgNotesModel,
	OrgPhoneModel,
	OrgPhotosModel,
	OrgReviewModel,
	OrgServiceModel,
	OrgSocialMediaModel,
	OrgSourceModel,
	OrganizationModel,
	PhoneTypeModel,
	ServiceCategoryModel,
	ServiceTypeModel,
	SessionModel,
	SocialMediaServiceModel,
	TranslationCategoryModel,
	TranslationItemModel,
	TranslationModel,
	TranslationVariableModel,
	UserCommunityModel,
	UserEthnicityModel,
	UserImmigrationModel,
	UserListModel,
	UserPermissionModel,
	UserRoleModel,
	UserSOGModel,
	UserTitleModel,
	UserTypeModel,
} from './index'

export const _UserModel = z.object({
	id: z.string(),
	name: z.string().nullish(),
	email: z.string().nullish(),
	emailVerified: z.date().nullish(),
	image: z.string().nullish(),
	orgTitleId: z.string().nullish(),
	immigrationId: z.string().nullish(),
	birthYear: z.string().nullish(),
	roleId: z.string(),
	userTypeId: z.string(),
	reasonForJoin: z.string().nullish(),
	langPrefId: z.string(),
})

export interface CompleteUser extends z.infer<typeof _UserModel> {
	accounts: CompleteAccount[]
	sessions: CompleteSession[]
	orgOwner: CompleteOrganization[]
	orgTitle?: CompleteUserTitle | null
	ethnicity: CompleteUserEthnicity[]
	countryOrigin: CompleteCountry[]
	immigration?: CompleteUserImmigration | null
	SOG: CompleteUserSOG[]
	role: CompleteUserRole
	permissions: CompleteUserPermission[]
	userType: CompleteUserType
	lists: CompleteUserList[]
	sharedLists: CompleteUserList[]
	communities: CompleteUserCommunity[]
	langPref: CompleteLanguage
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
	createOrgNotes: CompleteOrgNotes[]
	updateOrgNotes: CompleteOrgNotes[]
	createOrgPhone: CompleteOrgPhone[]
	updateOrgPhone: CompleteOrgPhone[]
	createOrgPhotos: CompleteOrgPhotos[]
	updateOrgPhotos: CompleteOrgPhotos[]
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
	createServiceType: CompleteServiceType[]
	updateServiceType: CompleteServiceType[]
	createOrgSocialMedia: CompleteOrgSocialMedia[]
	updateOrgSocialMedia: CompleteOrgSocialMedia[]
	createOrgSource: CompleteOrgSource[]
	updateOrgSource: CompleteOrgSource[]
	createCountry: CompleteCountry[]
	updateCountry: CompleteCountry[]
	createCountryTranslation: CompleteCountryTranslation[]
	updateCountryTranslation: CompleteCountryTranslation[]
	createGovDist: CompleteGovDist[]
	updateGovDist: CompleteGovDist[]
	createLanguage: CompleteLanguage[]
	updateLanguage: CompleteLanguage[]
	createTranslationCategory: CompleteTranslationCategory[]
	updateTranslationCategory: CompleteTranslationCategory[]
	createTranslationItem: CompleteTranslationItem[]
	updateTranslationItem: CompleteTranslationItem[]
	createTranslation: CompleteTranslation[]
	updateTranslation: CompleteTranslation[]
	createSocialMediaService: CompleteSocialMediaService[]
	updateSocialMediaService: CompleteSocialMediaService[]
	createUserRole: CompleteUserRole[]
	updateUserRole: CompleteUserRole[]
	createUserPermission: CompleteUserPermission[]
	updateUserPermission: CompleteUserPermission[]
	createTranslationVariable: CompleteTranslationVariable[]
	updateTranslationVariable: CompleteTranslationVariable[]
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
		orgOwner: OrganizationModel.array(),
		orgTitle: UserTitleModel.nullish(),
		ethnicity: UserEthnicityModel.array(),
		countryOrigin: CountryModel.array(),
		immigration: UserImmigrationModel.nullish(),
		SOG: UserSOGModel.array(),
		role: UserRoleModel,
		permissions: UserPermissionModel.array(),
		userType: UserTypeModel,
		lists: UserListModel.array(),
		sharedLists: UserListModel.array(),
		communities: UserCommunityModel.array(),
		langPref: LanguageModel,
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
		createOrgNotes: OrgNotesModel.array(),
		updateOrgNotes: OrgNotesModel.array(),
		createOrgPhone: OrgPhoneModel.array(),
		updateOrgPhone: OrgPhoneModel.array(),
		createOrgPhotos: OrgPhotosModel.array(),
		updateOrgPhotos: OrgPhotosModel.array(),
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
		createServiceType: ServiceTypeModel.array(),
		updateServiceType: ServiceTypeModel.array(),
		createOrgSocialMedia: OrgSocialMediaModel.array(),
		updateOrgSocialMedia: OrgSocialMediaModel.array(),
		createOrgSource: OrgSourceModel.array(),
		updateOrgSource: OrgSourceModel.array(),
		createCountry: CountryModel.array(),
		updateCountry: CountryModel.array(),
		createCountryTranslation: CountryTranslationModel.array(),
		updateCountryTranslation: CountryTranslationModel.array(),
		createGovDist: GovDistModel.array(),
		updateGovDist: GovDistModel.array(),
		createLanguage: LanguageModel.array(),
		updateLanguage: LanguageModel.array(),
		createTranslationCategory: TranslationCategoryModel.array(),
		updateTranslationCategory: TranslationCategoryModel.array(),
		createTranslationItem: TranslationItemModel.array(),
		updateTranslationItem: TranslationItemModel.array(),
		createTranslation: TranslationModel.array(),
		updateTranslation: TranslationModel.array(),
		createSocialMediaService: SocialMediaServiceModel.array(),
		updateSocialMediaService: SocialMediaServiceModel.array(),
		createUserRole: UserRoleModel.array(),
		updateUserRole: UserRoleModel.array(),
		createUserPermission: UserPermissionModel.array(),
		updateUserPermission: UserPermissionModel.array(),
		createTranslationVariable: TranslationVariableModel.array(),
		updateTranslationVariable: TranslationVariableModel.array(),
	})
)
