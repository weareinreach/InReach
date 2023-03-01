import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

import { CreateAuditLog } from '~api/schemas/create/auditLog'

type UpdateOrg = Prisma.OrgReviewUpdateArgs

const ReviewUpdateActor = { id: z.string(), actorId: z.string() }

export const ReviewVisibility = z
	.object({ ...ReviewUpdateActor, visible: z.boolean() })
	.transform(({ id, actorId, visible }) =>
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

export const ReviewToggleDelete = z
	.object({ ...ReviewUpdateActor, deleted: z.boolean() })
	.transform(({ id, actorId, deleted }) =>
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
