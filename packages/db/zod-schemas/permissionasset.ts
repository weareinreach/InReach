import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteOrgLocation,
	CompleteOrganization,
	CompletePermissionItem,
	CompleteUser,
	OrgLocationModel,
	OrganizationModel,
	PermissionItemModel,
	UserModel,
} from './index'

export const _PermissionAssetModel = z.object({
	id: imports.cuid,
	userId: imports.cuid,
	permissionId: imports.cuid,
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompletePermissionAsset extends z.infer<typeof _PermissionAssetModel> {
	user: CompleteUser
	permission: CompletePermissionItem
	organization: CompleteOrganization[]
	location: CompleteOrgLocation[]
	auditLog: CompleteAuditLog[]
}

/**
 * PermissionAssetModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const PermissionAssetModel: z.ZodSchema<CompletePermissionAsset> = z.lazy(() =>
	_PermissionAssetModel.extend({
		user: UserModel,
		permission: PermissionItemModel,
		organization: OrganizationModel.array(),
		location: OrgLocationModel.array(),
		auditLog: AuditLogModel.array(),
	})
)
