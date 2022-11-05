import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteCountry,
	CompleteGovDist,
	CompleteLanguage,
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
	CompleteServiceCategory,
	CompleteServiceTag,
	CompleteTranslation,
	CompleteTranslationKey,
	CompleteTranslationNamespace,
	CompleteTranslationVariable,
	CompleteUser,
	CountryModel,
	GovDistModel,
	LanguageModel,
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
	ServiceCategoryModel,
	ServiceTagModel,
	TranslationKeyModel,
	TranslationModel,
	TranslationNamespaceModel,
	TranslationVariableModel,
	UserModel,
} from './index'

export const _InternalNoteModel = z.object({
	id: z.string().cuid(),
	text: z.string(),
	orgId: z.string().cuid().nullish(),
	orgDescriptionId: z.string().cuid().nullish(),
	orgEmailId: z.string().cuid().nullish(),
	orgPhoneId: z.string().cuid().nullish(),
	orgSocialMediaId: z.string().cuid().nullish(),
	orgLocationId: z.string().cuid().nullish(),
	orgPhotoId: z.string().cuid().nullish(),
	orgHoursId: z.string().cuid().nullish(),
	orgServiceId: z.string().cuid().nullish(),
	orgReviewId: z.string().cuid().nullish(),
	serviceCategoryId: z.string().cuid().nullish(),
	serviceTagId: z.string().cuid().nullish(),
	countryId: z.string().cuid().nullish(),
	govDistId: z.string().cuid().nullish(),
	languageId: z.string().cuid().nullish(),
	translationNamespaceId: z.string().cuid().nullish(),
	translationKeyId: z.string().cuid().nullish(),
	translationId: z.string().cuid().nullish(),
	translationVariableId: z.string().cuid().nullish(),
	outsideApiId: z.string().cuid().nullish(),
	createdAt: z.date(),
	createdById: z.string().cuid(),
	updatedAt: z.date(),
	updatedById: z.string().cuid(),
})

export interface CompleteInternalNote extends z.infer<typeof _InternalNoteModel> {
	organization?: CompleteOrganization | null
	orgDescription?: CompleteOrgDescription | null
	orgEmail?: CompleteOrgEmail | null
	orgPhone?: CompleteOrgPhone | null
	orgSocialMedia?: CompleteOrgSocialMedia | null
	orgLocation?: CompleteOrgLocation | null
	orgPhoto?: CompleteOrgPhoto | null
	orgHours?: CompleteOrgHours | null
	orgService?: CompleteOrgService | null
	orgReview?: CompleteOrgReview | null
	serviceCategory?: CompleteServiceCategory | null
	serviceTag?: CompleteServiceTag | null
	country?: CompleteCountry | null
	govDist?: CompleteGovDist | null
	language?: CompleteLanguage | null
	translationNamespace?: CompleteTranslationNamespace | null
	translationKey?: CompleteTranslationKey | null
	translation?: CompleteTranslation | null
	translationVariable?: CompleteTranslationVariable | null
	outsideApi?: CompleteOutsideAPI | null
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * InternalNoteModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const InternalNoteModel: z.ZodSchema<CompleteInternalNote> = z.lazy(() =>
	_InternalNoteModel.extend({
		organization: OrganizationModel.nullish(),
		orgDescription: OrgDescriptionModel.nullish(),
		orgEmail: OrgEmailModel.nullish(),
		orgPhone: OrgPhoneModel.nullish(),
		orgSocialMedia: OrgSocialMediaModel.nullish(),
		orgLocation: OrgLocationModel.nullish(),
		orgPhoto: OrgPhotoModel.nullish(),
		orgHours: OrgHoursModel.nullish(),
		orgService: OrgServiceModel.nullish(),
		orgReview: OrgReviewModel.nullish(),
		serviceCategory: ServiceCategoryModel.nullish(),
		serviceTag: ServiceTagModel.nullish(),
		country: CountryModel.nullish(),
		govDist: GovDistModel.nullish(),
		language: LanguageModel.nullish(),
		translationNamespace: TranslationNamespaceModel.nullish(),
		translationKey: TranslationKeyModel.nullish(),
		translation: TranslationModel.nullish(),
		translationVariable: TranslationVariableModel.nullish(),
		outsideApi: OutsideAPIModel.nullish(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
