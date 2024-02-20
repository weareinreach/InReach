import { z } from 'zod'

import { Prisma } from '@weareinreach/db'

type UpdateOrg = Prisma.OrgReviewUpdateArgs

const ReviewUpdateActor = { id: z.string(), actorId: z.string() }

export const ReviewVisibility = z
	.object({ ...ReviewUpdateActor, visible: z.boolean() })
	.transform(({ id, visible }) =>
		Prisma.validator<UpdateOrg>()({
			where: { id },
			data: {
				visible,
			},
			select: {
				id: true,
				visible: true,
			},
		})
	)

export const ReviewToggleDelete = z
	.object({ ...ReviewUpdateActor, deleted: z.boolean() })
	.transform(({ id, deleted }) =>
		Prisma.validator<UpdateOrg>()({
			where: { id },
			data: {
				deleted,
			},
			select: {
				id: true,
				visible: true,
			},
		})
	)
