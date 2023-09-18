import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpdateSchema = z
	.object({
		id: prefixedId('orgPhone'),
		data: z
			.object({
				number: z.string(),
				ext: z.string(),
				primary: z.boolean(),
				published: z.boolean(),
				deleted: z.boolean(),
				countryId: prefixedId('country'),
				phoneTypeId: prefixedId('phoneType'),
				locationOnly: z.boolean(),
			})
			.partial(),
	})
	.transform(({ data, id }) => Prisma.validator<Prisma.OrgPhoneUpdateArgs>()({ where: { id }, data }))
export type TUpdateSchema = z.infer<typeof ZUpdateSchema>
