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
				organizationId: prefixedId('organization').nullish().catch(undefined),
				orgLocationId: prefixedId('orgLocation').optional().catch(undefined),
				orgLocationOnly: z.boolean(),
			})
			.partial(),
	})
	.transform(({ data: { orgLocationId, organizationId, ...data }, id }) => {
		return Prisma.validator<Prisma.OrgWebsiteUpdateArgs>()({
			where: { id },
			data: {
				...data,
				...(orgLocationId && {
					locations: {
						upsert: {
							where: {
								orgLocationId_orgWebsiteId: {
									orgLocationId,
									orgWebsiteId: id,
								},
							},
							create: { orgLocationId },
							update: { orgLocationId },
						},
					},
				}),
				...(organizationId && { organization: { connect: { id: organizationId } } }),
			},
		})
	})
export type TUpdateSchema = z.infer<typeof ZUpdateSchema>
