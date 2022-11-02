import * as z from 'zod'

import {
	CompleteCountryTranslation,
	CompleteGovDist,
	CompleteOrgDescription,
	CompleteOrgService,
	CompletePhoneType,
	CompleteServiceCategory,
	CompleteServiceType,
	CompleteTranslation,
	CompleteUser,
	CompleteUserCommunity,
	CompleteUserEthnicity,
	CompleteUserImmigration,
	CompleteUserSOG,
	CompleteUserTitle,
	CompleteUserType,
	CountryTranslationModel,
	GovDistModel,
	OrgDescriptionModel,
	OrgServiceModel,
	PhoneTypeModel,
	ServiceCategoryModel,
	ServiceTypeModel,
	TranslationModel,
	UserCommunityModel,
	UserEthnicityModel,
	UserImmigrationModel,
	UserModel,
	UserSOGModel,
	UserTitleModel,
	UserTypeModel,
} from './index'

export const _LanguageModel = z.object({
	id: z.string(),
	languageName: z.string(),
	langCode: z.string(),
	nativeName: z.string(),
	createdAt: z.date(),
	createdById: z.string().nullish(),
	updatedAt: z.date(),
	updatedById: z.string().nullish(),
})

export interface CompleteLanguage extends z.infer<typeof _LanguageModel> {
	translations: CompleteTranslation[]
	orgDescriptions: CompleteOrgDescription[]
	userTitle: CompleteUserTitle[]
	ServiceCategory: CompleteServiceCategory[]
	PhoneType: CompletePhoneType[]
	ServiceType: CompleteServiceType[]
	CountryTranslation: CompleteCountryTranslation[]
	OrgService: CompleteOrgService[]
	UserEthnicity: CompleteUserEthnicity[]
	UserSOG: CompleteUserSOG[]
	UserType: CompleteUserType[]
	UserImmigration: CompleteUserImmigration[]
	GovDist: CompleteGovDist[]
	UserCommunity: CompleteUserCommunity[]
	User: CompleteUser[]
	createdBy?: CompleteUser | null
	updatedBy?: CompleteUser | null
}

/**
 * LanguageModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const LanguageModel: z.ZodSchema<CompleteLanguage> = z.lazy(() =>
	_LanguageModel.extend({
		translations: TranslationModel.array(),
		orgDescriptions: OrgDescriptionModel.array(),
		userTitle: UserTitleModel.array(),
		ServiceCategory: ServiceCategoryModel.array(),
		PhoneType: PhoneTypeModel.array(),
		ServiceType: ServiceTypeModel.array(),
		CountryTranslation: CountryTranslationModel.array(),
		OrgService: OrgServiceModel.array(),
		UserEthnicity: UserEthnicityModel.array(),
		UserSOG: UserSOGModel.array(),
		UserType: UserTypeModel.array(),
		UserImmigration: UserImmigrationModel.array(),
		GovDist: GovDistModel.array(),
		UserCommunity: UserCommunityModel.array(),
		User: UserModel.array(),
		createdBy: UserModel.nullish(),
		updatedBy: UserModel.nullish(),
	})
)
