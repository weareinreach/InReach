import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpsertManySchema = z.object({
	orgId: prefixedId('organization'),
	data: z
		.object({
			id: z.string().optional(),
			number: z.string(),
			ext: z.string().nullish(),
			country: z.object({ id: prefixedId('country'), cca2: z.string() }),
			phoneType: prefixedId('phoneType').nullish(),
			primary: z.boolean(),
			published: z.boolean(),
			deleted: z.boolean(),
			locations: prefixedId('orgLocation').array(),
			services: prefixedId('orgService').array(),
			description: z.string().optional(),
		})
		.array(),
})

export type TUpsertManySchema = z.infer<typeof ZUpsertManySchema>
