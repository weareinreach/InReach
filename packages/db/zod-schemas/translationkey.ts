import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteCountry,
	CompleteGovDist,
	CompleteGovDistType,
	CompleteInternalNote,
	CompleteNavigation,
	CompleteServiceCategory,
	CompleteServiceTag,
	CompleteTranslationNamespace,
	CompleteUser,
	CompleteUserCommunity,
	CompleteUserEthnicity,
	CompleteUserImmigration,
	CompleteUserSOG,
	CompleteUserType,
	CountryModel,
	GovDistModel,
	GovDistTypeModel,
	InternalNoteModel,
	NavigationModel,
	ServiceCategoryModel,
	ServiceTagModel,
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
	UserType: CompleteUserType[]
	UserEthnicity: CompleteUserEthnicity[]
	UserImmigration: CompleteUserImmigration[]
	UserSOG: CompleteUserSOG[]
	UserCommunity: CompleteUserCommunity[]
	ServiceCategory: CompleteServiceCategory[]
	ServiceTag: CompleteServiceTag[]
	Country: CompleteCountry[]
	GovDist: CompleteGovDist[]
	GovDistType: CompleteGovDistType[]
	Navigation: CompleteNavigation[]
	createdBy?: CompleteUser | null
	updatedBy?: CompleteUser | null
	InternalNote: CompleteInternalNote[]
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
		UserType: UserTypeModel.array(),
		UserEthnicity: UserEthnicityModel.array(),
		UserImmigration: UserImmigrationModel.array(),
		UserSOG: UserSOGModel.array(),
		UserCommunity: UserCommunityModel.array(),
		ServiceCategory: ServiceCategoryModel.array(),
		ServiceTag: ServiceTagModel.array(),
		Country: CountryModel.array(),
		GovDist: GovDistModel.array(),
		GovDistType: GovDistTypeModel.array(),
		Navigation: NavigationModel.array(),
		createdBy: UserModel.nullish(),
		updatedBy: UserModel.nullish(),
		InternalNote: InternalNoteModel.array(),
	})
)
