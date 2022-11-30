import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AttributeCategoryModel,
	AttributeModel,
	AttributeSupplementModel,
	AuditLogModel,
	CompleteAttribute,
	CompleteAttributeCategory,
	CompleteAttributeSupplement,
	CompleteAuditLog,
	CompleteCountry,
	CompleteFooterLink,
	CompleteGovDist,
	CompleteGovDistType,
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
	CompletePhoneType,
	CompleteServiceCategory,
	CompleteServiceTag,
	CompleteSocialMediaLink,
	CompleteSocialMediaService,
	CompleteSource,
	CompleteTranslationKey,
	CompleteTranslationNamespace,
	CountryModel,
	FooterLinkModel,
	GovDistModel,
	GovDistTypeModel,
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
	PhoneTypeModel,
	ServiceCategoryModel,
	ServiceTagModel,
	SocialMediaLinkModel,
	SocialMediaServiceModel,
	SourceModel,
	TranslationKeyModel,
	TranslationNamespaceModel,
} from './index'

export const _InternalNoteModel = z.object({
	id: imports.cuid,
	text: z.string(),
	attributeId: imports.cuid.nullish(),
	attributeCategoryId: imports.cuid.nullish(),
	attributeSupplementId: imports.cuid.nullish(),
	countryId: imports.cuid.nullish(),
	footerLinkId: imports.cuid.nullish(),
	govDistId: imports.cuid.nullish(),
	govDistTypeId: imports.cuid.nullish(),
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
	outsideApiId: imports.cuid.nullish(),
	phoneTypeId: imports.cuid.nullish(),
	serviceCategoryId: imports.cuid.nullish(),
	serviceTagId: imports.cuid.nullish(),
	socialMediaLinkId: imports.cuid.nullish(),
	socialMediaServiceId: imports.cuid.nullish(),
	sourceId: imports.cuid.nullish(),
	translationKeyId: imports.cuid.nullish(),
	translationNamespaceId: imports.cuid.nullish(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteInternalNote extends z.infer<typeof _InternalNoteModel> {
	attribute?: CompleteAttribute | null
	attributeCategory?: CompleteAttributeCategory | null
	attributeSupplement?: CompleteAttributeSupplement | null
	country?: CompleteCountry | null
	footerLink?: CompleteFooterLink | null
	govDist?: CompleteGovDist | null
	govDistType?: CompleteGovDistType | null
	language?: CompleteLanguage | null
	navigation?: CompleteNavigation | null
	organization?: CompleteOrganization | null
	orgDescription?: CompleteOrgDescription | null
	orgEmail?: CompleteOrgEmail | null
	orgHours?: CompleteOrgHours | null
	orgLocation?: CompleteOrgLocation | null
	orgPhone?: CompleteOrgPhone | null
	orgPhoto?: CompleteOrgPhoto | null
	orgReview?: CompleteOrgReview | null
	orgService?: CompleteOrgService | null
	orgSocialMedia?: CompleteOrgSocialMedia | null
	outsideApi?: CompleteOutsideAPI | null
	phoneType?: CompletePhoneType | null
	serviceCategory?: CompleteServiceCategory | null
	serviceTag?: CompleteServiceTag | null
	socialMediaLink?: CompleteSocialMediaLink | null
	socialMediaService?: CompleteSocialMediaService | null
	source?: CompleteSource | null
	translationKey?: CompleteTranslationKey | null
	translationNamespace?: CompleteTranslationNamespace | null
	auditLog: CompleteAuditLog[]
}

/**
 * InternalNoteModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const InternalNoteModel: z.ZodSchema<CompleteInternalNote> = z.lazy(() =>
	_InternalNoteModel.extend({
		attribute: AttributeModel.nullish(),
		attributeCategory: AttributeCategoryModel.nullish(),
		attributeSupplement: AttributeSupplementModel.nullish(),
		country: CountryModel.nullish(),
		footerLink: FooterLinkModel.nullish(),
		govDist: GovDistModel.nullish(),
		govDistType: GovDistTypeModel.nullish(),
		language: LanguageModel.nullish(),
		navigation: NavigationModel.nullish(),
		organization: OrganizationModel.nullish(),
		orgDescription: OrgDescriptionModel.nullish(),
		orgEmail: OrgEmailModel.nullish(),
		orgHours: OrgHoursModel.nullish(),
		orgLocation: OrgLocationModel.nullish(),
		orgPhone: OrgPhoneModel.nullish(),
		orgPhoto: OrgPhotoModel.nullish(),
		orgReview: OrgReviewModel.nullish(),
		orgService: OrgServiceModel.nullish(),
		orgSocialMedia: OrgSocialMediaModel.nullish(),
		outsideApi: OutsideAPIModel.nullish(),
		phoneType: PhoneTypeModel.nullish(),
		serviceCategory: ServiceCategoryModel.nullish(),
		serviceTag: ServiceTagModel.nullish(),
		socialMediaLink: SocialMediaLinkModel.nullish(),
		socialMediaService: SocialMediaServiceModel.nullish(),
		source: SourceModel.nullish(),
		translationKey: TranslationKeyModel.nullish(),
		translationNamespace: TranslationNamespaceModel.nullish(),
		auditLog: AuditLogModel.array(),
	})
)
