import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpsertManySchema = z.object({
	orgId: prefixedId('organization'),
	data: z
		.object({
			id: prefixedId('orgEmail').optional(),
			email: z.string(),
			firstName: z.string().nullish(),
			lastName: z.string().nullish(),
			title: z.string().nullish(),
			description: z.string().optional(),
			primary: z.boolean(),
			published: z.boolean(),
			deleted: z.boolean(),
			locations: z.string().array(),
			services: z.string().array(),
		})
		.array(),
})
export type TUpsertManySchema = z.infer<typeof ZUpsertManySchema>
