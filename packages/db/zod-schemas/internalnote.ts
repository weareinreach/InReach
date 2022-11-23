import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AttributeCategoryModel,
	AttributeModel,
	AttributeSupplementModel,
	CompleteAttribute,
	CompleteAttributeCategory,
	CompleteAttributeSupplement,
	CompleteCountry,
	CompleteFooterLink,
	CompleteGovDist,
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
	CompleteServiceCategory,
	CompleteServiceTag,
	CompleteSocialMediaLink,
	CompleteTranslationKey,
	CompleteTranslationNamespace,
	CompleteUser,
	CountryModel,
	FooterLinkModel,
	GovDistModel,
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
	ServiceCategoryModel,
	ServiceTagModel,
	SocialMediaLinkModel,
	TranslationKeyModel,
	TranslationNamespaceModel,
	UserModel,
} from './index'

export const _InternalNoteModel = z.object({
	id: imports.cuid,
	text: z.string(),
	orgId: imports.cuid.nullish(),
	orgDescriptionId: imports.cuid.nullish(),
	orgEmailId: imports.cuid.nullish(),
	orgPhoneId: imports.cuid.nullish(),
	orgSocialMediaId: imports.cuid.nullish(),
	orgLocationId: imports.cuid.nullish(),
	orgPhotoId: imports.cuid.nullish(),
	orgHoursId: imports.cuid.nullish(),
	orgServiceId: imports.cuid.nullish(),
	orgReviewId: imports.cuid.nullish(),
	serviceCategoryId: imports.cuid.nullish(),
	serviceTagId: imports.cuid.nullish(),
	countryId: imports.cuid.nullish(),
	govDistId: imports.cuid.nullish(),
	languageId: imports.cuid.nullish(),
	translationNamespaceId: imports.cuid.nullish(),
	translationKeyId: imports.cuid.nullish(),
	outsideApiId: imports.cuid.nullish(),
	navigationId: imports.cuid.nullish(),
	footerLinkId: imports.cuid.nullish(),
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
	socialMediaLinkId: z.string().nullish(),
	propertyCategoryId: z.string().nullish(),
	propertyAttributeId: z.string().nullish(),
	attributeSupplementId: z.string().nullish(),
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
	outsideApi?: CompleteOutsideAPI | null
	navigation?: CompleteNavigation | null
	footerLink?: CompleteFooterLink | null
	createdBy: CompleteUser
	updatedBy: CompleteUser
	socialMediaLink?: CompleteSocialMediaLink | null
	attributeCategory?: CompleteAttributeCategory | null
	attribute?: CompleteAttribute | null
	AttributeSupplement?: CompleteAttributeSupplement | null
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
		outsideApi: OutsideAPIModel.nullish(),
		navigation: NavigationModel.nullish(),
		footerLink: FooterLinkModel.nullish(),
		createdBy: UserModel,
		updatedBy: UserModel,
		socialMediaLink: SocialMediaLinkModel.nullish(),
		attributeCategory: AttributeCategoryModel.nullish(),
		attribute: AttributeModel.nullish(),
		AttributeSupplement: AttributeSupplementModel.nullish(),
	})
)
