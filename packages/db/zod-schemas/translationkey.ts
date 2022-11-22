import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AttributeModel,
	CompleteAttribute,
	CompleteCountry,
	CompleteFooterLink,
	CompleteGovDist,
	CompleteGovDistType,
	CompleteInternalNote,
	CompleteNavigation,
	CompleteServiceCategory,
	CompleteServiceTag,
	CompleteSocialMediaLink,
	CompleteTranslationNamespace,
	CompleteUser,
	CompleteUserCommunity,
	CompleteUserEthnicity,
	CompleteUserImmigration,
	CompleteUserSOG,
	CompleteUserType,
	CountryModel,
	FooterLinkModel,
	GovDistModel,
	GovDistTypeModel,
	InternalNoteModel,
	NavigationModel,
	ServiceCategoryModel,
	ServiceTagModel,
	SocialMediaLinkModel,
	TranslationNamespaceModel,
	UserCommunityModel,
	UserEthnicityModel,
	UserImmigrationModel,
	UserModel,
	UserSOGModel,
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
	parentId: imports.cuid.nullish(),
	createdAt: z.date(),
	createdById: imports.cuid.nullish(),
	updatedAt: z.date(),
	updatedById: imports.cuid.nullish(),
})

export interface CompleteTranslationKey extends z.infer<typeof _TranslationKeyModel> {
	namespace: CompleteTranslationNamespace
	parent?: CompleteTranslationKey | null
	children: CompleteTranslationKey[]
	userType: CompleteUserType[]
	userEthnicity: CompleteUserEthnicity[]
	userImmigration: CompleteUserImmigration[]
	userSOG: CompleteUserSOG[]
	userCommunity: CompleteUserCommunity[]
	serviceCategory: CompleteServiceCategory[]
	serviceTag: CompleteServiceTag[]
	country: CompleteCountry[]
	govDist: CompleteGovDist[]
	govDistType: CompleteGovDistType[]
	navigation: CompleteNavigation[]
	footerLink: CompleteFooterLink[]
	socialMediaLink: CompleteSocialMediaLink[]
	attribute: CompleteAttribute[]
	createdBy?: CompleteUser | null
	updatedBy?: CompleteUser | null
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
		userType: UserTypeModel.array(),
		userEthnicity: UserEthnicityModel.array(),
		userImmigration: UserImmigrationModel.array(),
		userSOG: UserSOGModel.array(),
		userCommunity: UserCommunityModel.array(),
		serviceCategory: ServiceCategoryModel.array(),
		serviceTag: ServiceTagModel.array(),
		country: CountryModel.array(),
		govDist: GovDistModel.array(),
		govDistType: GovDistTypeModel.array(),
		navigation: NavigationModel.array(),
		footerLink: FooterLinkModel.array(),
		socialMediaLink: SocialMediaLinkModel.array(),
		attribute: AttributeModel.array(),
		createdBy: UserModel.nullish(),
		updatedBy: UserModel.nullish(),
		internalNote: InternalNoteModel.array(),
	})
)
