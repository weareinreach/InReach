import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpdateSchema = z
	.object({
		id: prefixedId('orgEmail'),
		data: z
			.object({
				firstName: z.string(),
				lastName: z.string(),
				primary: z.boolean(),
				email: z.string(),
				published: z.boolean(),
				deleted: z.boolean(),
				titleId: prefixedId('userTitle'),
				locationOnly: z.boolean(),
				serviceOnly: z.boolean(),
			})
			.partial(),
	})
	.transform(({ data, id }) => Prisma.validator<Prisma.OrgEmailUpdateArgs>()({ where: { id }, data }))
export type TUpdateSchema = z.infer<typeof ZUpdateSchema>
