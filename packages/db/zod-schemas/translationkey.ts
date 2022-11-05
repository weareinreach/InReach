import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteCountry,
	CompleteGovDist,
	CompleteGovDistType,
	CompleteInternalNote,
	CompleteServiceCategory,
	CompleteServiceTag,
	CompleteTranslation,
	CompleteTranslationNamespace,
	CompleteTranslationVariable,
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
	ServiceCategoryModel,
	ServiceTagModel,
	TranslationModel,
	TranslationNamespaceModel,
	TranslationVariableModel,
	UserCommunityModel,
	UserEthnicityModel,
	UserImmigrationModel,
	UserModel,
	UserSOGModel,
	UserTypeModel,
} from './index'

export const _TranslationKeyModel = z.object({
	id: z.string().cuid(),
	/** Item key */
	key: z.string(),
	namespaceId: z.string().cuid(),
	isBase: z.boolean(),
	parentId: z.string().cuid().nullish(),
	createdAt: z.date(),
	createdById: z.string().cuid(),
	updatedAt: z.date(),
	updatedById: z.string().cuid(),
})

export interface CompleteTranslationKey extends z.infer<typeof _TranslationKeyModel> {
	namespace: CompleteTranslationNamespace
	translations: CompleteTranslation[]
	variables: CompleteTranslationVariable[]
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
	createdBy: CompleteUser
	updatedBy: CompleteUser
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
		translations: TranslationModel.array(),
		variables: TranslationVariableModel.array(),
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
		createdBy: UserModel,
		updatedBy: UserModel,
		InternalNote: InternalNoteModel.array(),
	})
)
