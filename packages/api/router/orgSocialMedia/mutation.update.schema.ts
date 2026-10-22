import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'
import { webUrlString } from '~api/schemas/webUrl'

export const ZUpdateSchema = z
	.object({
		id: prefixedId('orgSocialMedia'),
		data: z
			.object({
				username: z.string(),
				url: webUrlString(),
				published: z.boolean(),
				deleted: z.boolean(),
				serviceId: z.string(),
				organizationId: prefixedId('organization').nullable(),
				orgLocationId: prefixedId('orgLocation').nullable(),
				orgLocationOnly: z.boolean(),
			})
			.partial(),
	})
	.transform(({ data, id }) => Prisma.validator<Prisma.OrgSocialMediaUpdateArgs>()({ where: { id }, data }))
export type TUpdateSchema = z.infer<typeof ZUpdateSchema>
