import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AttributeModel,
	CompleteAttribute,
	CompleteInternalNote,
	CompleteOrgLocation,
	CompleteOrgService,
	CompleteOrganization,
	CompleteServiceCategory,
	CompleteServiceTag,
	CompleteUser,
	InternalNoteModel,
	OrgLocationModel,
	OrgServiceModel,
	OrganizationModel,
	ServiceCategoryModel,
	ServiceTagModel,
	UserModel,
} from './index'

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
	z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
)

export const _AttributeSupplementModel = z.object({
	id: imports.cuid,
	data: jsonSchema,
	attributeId: imports.cuid,
	organizationId: imports.cuid.nullish(),
	serviceId: imports.cuid.nullish(),
	locationId: imports.cuid.nullish(),
	serviceTagId: imports.cuid.nullish(),
	serviceCategoryId: imports.cuid.nullish(),
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteAttributeSupplement extends z.infer<typeof _AttributeSupplementModel> {
	attribute: CompleteAttribute
	organization?: CompleteOrganization | null
	service?: CompleteOrgService | null
	location?: CompleteOrgLocation | null
	serviceTag?: CompleteServiceTag | null
	serviceCategory?: CompleteServiceCategory | null
	createdBy: CompleteUser
	updatedBy: CompleteUser
	internalNote: CompleteInternalNote[]
}

/**
 * AttributeSupplementModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const AttributeSupplementModel: z.ZodSchema<CompleteAttributeSupplement> = z.lazy(() =>
	_AttributeSupplementModel.extend({
		attribute: AttributeModel,
		organization: OrganizationModel.nullish(),
		service: OrgServiceModel.nullish(),
		location: OrgLocationModel.nullish(),
		serviceTag: ServiceTagModel.nullish(),
		serviceCategory: ServiceCategoryModel.nullish(),
		createdBy: UserModel,
		updatedBy: UserModel,
		internalNote: InternalNoteModel.array(),
	})
)
