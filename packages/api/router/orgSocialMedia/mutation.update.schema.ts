import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpdateSchema = z
	.object({
		id: prefixedId('orgSocialMedia'),
		data: z
			.object({
				username: z.string(),
				url: z.string(),
				published: z.boolean(),
				deleted: z.boolean(),
				serviceId: z.string(),
				organizationId: prefixedId('organization'),
				orgLocationId: prefixedId('orgLocation'),
				orgLocationOnly: z.boolean(),
			})
			.partial(),
	})
	.transform(({ data, id }) => Prisma.validator<Prisma.OrgSocialMediaUpdateArgs>()({ where: { id }, data }))
export type TUpdateSchema = z.infer<typeof ZUpdateSchema>
