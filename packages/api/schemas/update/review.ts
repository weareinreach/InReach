import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

import { id, actorId } from '~api/schemas/common'
import { CreateAuditLog } from '~api/schemas/create/auditLog'

type UpdateOrg = Prisma.OrgReviewUpdateArgs

const ReviewUpdateActor = id.merge(actorId)

export const ReviewVisibility = ReviewUpdateActor.extend({ visible: z.boolean() }).transform(
	({ id, actorId, visible }) =>
		Prisma.validator<UpdateOrg>()({
			where: { id },
			data: {
				visible,
				auditLogs: CreateAuditLog({
					actorId,
					operation: 'UPDATE',
					from: { visible: !visible },
					to: { visible },
				}),
			},
			select: {
				id: true,
				visible: true,
			},
		})
)

export const ReviewToggleDelete = ReviewUpdateActor.extend({ deleted: z.boolean() }).transform(
	({ id, actorId, deleted }) =>
		Prisma.validator<UpdateOrg>()({
			where: { id },
			data: {
				deleted,
				auditLogs: CreateAuditLog({
					actorId,
					operation: 'UPDATE',
					from: { deleted: !deleted },
					to: { deleted },
				}),
			},
			select: {
				id: true,
				visible: true,
			},
		})
)
