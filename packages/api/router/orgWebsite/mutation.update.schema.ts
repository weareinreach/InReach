import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpdateSchema = z
	.object({
		id: prefixedId('orgWebsite'),
		data: z
			.object({
				url: z.string(),
				isPrimary: z.boolean(),
				published: z.boolean(),
				deleted: z.boolean(),
				organizationId: prefixedId('organization'),
				orgLocationId: prefixedId('orgLocation'),
				orgLocationOnly: z.boolean(),
			})
			.partial(),
	})
	.transform(({ data, id }) => Prisma.validator<Prisma.OrgWebsiteUpdateArgs>()({ where: { id }, data }))
export type TUpdateSchema = z.infer<typeof ZUpdateSchema>
