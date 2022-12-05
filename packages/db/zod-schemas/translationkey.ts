import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AttributeModel,
	AuditLogModel,
	CompleteAttribute,
	CompleteAuditLog,
	CompleteCountry,
	CompleteFooterLink,
	CompleteGovDist,
	CompleteGovDistType,
	CompleteInternalNote,
	CompleteNavigation,
	CompleteOrgDescription,
	CompleteOrgService,
	CompletePhoneType,
	CompleteServiceCategory,
	CompleteServiceTag,
	CompleteSocialMediaService,
	CompleteTranslationNamespace,
	CompleteUserCommunity,
	CompleteUserEthnicity,
	CompleteUserImmigration,
	CompleteUserSOGIdentity,
	CompleteUserTitle,
	CompleteUserType,
	CountryModel,
	FooterLinkModel,
	GovDistModel,
	GovDistTypeModel,
	InternalNoteModel,
	NavigationModel,
	OrgDescriptionModel,
	OrgServiceModel,
	PhoneTypeModel,
	ServiceCategoryModel,
	ServiceTagModel,
	SocialMediaServiceModel,
	TranslationNamespaceModel,
	UserCommunityModel,
	UserEthnicityModel,
	UserImmigrationModel,
	UserSOGIdentityModel,
	UserTitleModel,
	UserTypeModel,
} from './index'

export const _TranslationKeyModel = z.object({
	id: imports.cuid,
	/** Item key */
	key: z.string(),
	/** Base string */
	text: z.string(),
	/** Context */
	context: z.string().nullish(),
	namespaceId: imports.cuid,
	ns: z.string(),
	parentId: imports.cuid.nullish(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteTranslationKey extends z.infer<typeof _TranslationKeyModel> {
	namespace: CompleteTranslationNamespace
	parent?: CompleteTranslationKey | null
	children: CompleteTranslationKey[]
	attribute?: CompleteAttribute | null
	country?: CompleteCountry | null
	demonym?: CompleteCountry | null
	footerLink?: CompleteFooterLink | null
	govDist: CompleteGovDist[]
	govDistType?: CompleteGovDistType | null
	navigation?: CompleteNavigation | null
	orgDescription?: CompleteOrgDescription | null
	orgServiceAccess?: CompleteOrgService | null
	orgServiceDesc?: CompleteOrgService | null
	phoneType?: CompletePhoneType | null
	serviceCategory?: CompleteServiceCategory | null
	serviceTag?: CompleteServiceTag | null
	socialMediaService?: CompleteSocialMediaService | null
	userCommunity?: CompleteUserCommunity | null
	userEthnicity?: CompleteUserEthnicity | null
	userImmigration?: CompleteUserImmigration | null
	userSOGIdentity?: CompleteUserSOGIdentity | null
	userTitle?: CompleteUserTitle | null
	userType?: CompleteUserType | null
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
}

/**
 * TranslationKeyModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const TranslationKeyModel: z.ZodSchema<CompleteTranslationKey> = z.lazy(() =>
	_TranslationKeyModel.extend({
		/** Associated namespace */
		namespace: TranslationNamespaceModel,
		parent: TranslationKeyModel.nullish(),
		children: TranslationKeyModel.array(),
		/** Associated tables */
		attribute: AttributeModel.nullish(),
		country: CountryModel.nullish(),
		demonym: CountryModel.nullish(),
		footerLink: FooterLinkModel.nullish(),
		govDist: GovDistModel.array(),
		govDistType: GovDistTypeModel.nullish(),
		navigation: NavigationModel.nullish(),
		orgDescription: OrgDescriptionModel.nullish(),
		orgServiceAccess: OrgServiceModel.nullish(),
		orgServiceDesc: OrgServiceModel.nullish(),
		phoneType: PhoneTypeModel.nullish(),
		serviceCategory: ServiceCategoryModel.nullish(),
		serviceTag: ServiceTagModel.nullish(),
		socialMediaService: SocialMediaServiceModel.nullish(),
		userCommunity: UserCommunityModel.nullish(),
		userEthnicity: UserEthnicityModel.nullish(),
		userImmigration: UserImmigrationModel.nullish(),
		userSOGIdentity: UserSOGIdentityModel.nullish(),
		userTitle: UserTitleModel.nullish(),
		userType: UserTypeModel.nullish(),
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
