import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpdateSchema = z
	.object({
		id: prefixedId('orgService'),
		data: z
			.object({
				published: z.boolean(),
				deleted: z.boolean(),
				checkMigration: z.boolean().nullable(),
			})
			.partial(),
	})
	.transform(({ id, data }) => Prisma.validator<Prisma.OrgServiceUpdateArgs>()({ where: { id }, data }))
export type TUpdateSchema = z.infer<typeof ZUpdateSchema>
