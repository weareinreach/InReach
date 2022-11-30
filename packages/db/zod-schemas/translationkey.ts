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
	attribute: CompleteAttribute[]
	country: CompleteCountry[]
	footerLink: CompleteFooterLink[]
	govDist: CompleteGovDist[]
	govDistType: CompleteGovDistType[]
	navigation: CompleteNavigation[]
	orgDescription: CompleteOrgDescription[]
	orgServiceAccess: CompleteOrgService[]
	orgServiceDesc: CompleteOrgService[]
	phoneType: CompletePhoneType[]
	serviceCategory: CompleteServiceCategory[]
	serviceTag: CompleteServiceTag[]
	socialMediaService: CompleteSocialMediaService[]
	userCommunity: CompleteUserCommunity[]
	userEthnicity: CompleteUserEthnicity[]
	userImmigration: CompleteUserImmigration[]
	userSOGIdentity: CompleteUserSOGIdentity[]
	userTitle: CompleteUserTitle[]
	userType: CompleteUserType[]
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
		attribute: AttributeModel.array(),
		country: CountryModel.array(),
		footerLink: FooterLinkModel.array(),
		govDist: GovDistModel.array(),
		govDistType: GovDistTypeModel.array(),
		navigation: NavigationModel.array(),
		orgDescription: OrgDescriptionModel.array(),
		orgServiceAccess: OrgServiceModel.array(),
		orgServiceDesc: OrgServiceModel.array(),
		phoneType: PhoneTypeModel.array(),
		serviceCategory: ServiceCategoryModel.array(),
		serviceTag: ServiceTagModel.array(),
		socialMediaService: SocialMediaServiceModel.array(),
		userCommunity: UserCommunityModel.array(),
		userEthnicity: UserEthnicityModel.array(),
		userImmigration: UserImmigrationModel.array(),
		userSOGIdentity: UserSOGIdentityModel.array(),
		userTitle: UserTitleModel.array(),
		userType: UserTypeModel.array(),
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
