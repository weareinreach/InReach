import { VisibilitySetting } from '@prisma/client'
import * as z from 'zod'

import * as imports from '../zod-util'
import { AuditLogModel, CompleteAuditLog, CompleteUser, UserModel } from './index'

export const _FieldVisibilityModel = z.object({
	id: imports.cuid,
	userId: imports.cuid,
	firstName: z.nativeEnum(VisibilitySetting),
	lastName: z.nativeEnum(VisibilitySetting),
	lastNameInit: z.nativeEnum(VisibilitySetting),
	email: z.nativeEnum(VisibilitySetting),
	image: z.nativeEnum(VisibilitySetting),
	ethnicity: z.nativeEnum(VisibilitySetting),
	countryOrigin: z.nativeEnum(VisibilitySetting),
	SOG: z.nativeEnum(VisibilitySetting),
	communities: z.nativeEnum(VisibilitySetting),
	currentCity: z.nativeEnum(VisibilitySetting),
	currentGovDist: z.nativeEnum(VisibilitySetting),
	currentCountry: z.nativeEnum(VisibilitySetting),
	/** For specialized accounts */
	userType: z.nativeEnum(VisibilitySetting),
	associatedOrg: z.nativeEnum(VisibilitySetting),
	orgTitle: z.nativeEnum(VisibilitySetting),
	/** To facilitate "User since..." */
	createdAt: z.nativeEnum(VisibilitySetting),
	recordCreatedAt: z.date(),
	recordupdatedAt: z.date(),
})

export interface CompleteFieldVisibility extends z.infer<typeof _FieldVisibilityModel> {
	user: CompleteUser
	auditLog: CompleteAuditLog[]
}

/**
 * FieldVisibilityModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const FieldVisibilityModel: z.ZodSchema<CompleteFieldVisibility> = z.lazy(() =>
	_FieldVisibilityModel.extend({
		user: UserModel,
		auditLog: AuditLogModel.array(),
	})
)
