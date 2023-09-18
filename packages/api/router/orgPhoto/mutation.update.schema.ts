import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpdateSchema = z
	.object({
		id: prefixedId('orgPhoto'),
		data: z
			.object({
				src: z.string(),
				height: z.number(),
				width: z.number(),
				published: z.boolean(),
				deleted: z.boolean(),
				orgId: prefixedId('organization'),
				orgLocationId: prefixedId('orgLocation'),
			})
			.partial(),
	})
	.transform(({ data, id }) => Prisma.validator<Prisma.OrgPhotoUpdateArgs>()({ where: { id }, data }))
export type TUpdateSchema = z.infer<typeof ZUpdateSchema>
