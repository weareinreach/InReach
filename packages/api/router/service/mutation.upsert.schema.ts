import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpsertSchema = z.object({
	id: prefixedId('orgService').optional(),
	organizationId: prefixedId('organization'),
	description: z.string().nullish(),
	deleted: z.boolean().optional(),
	published: z.boolean().optional(),
	name: z.string().nullish(),
	services: z
		.object({
			createdVals: z.string().array().nullable(),
			deletedVals: z.string().array().nullable(),
		})
		.optional(),
	attachToLocation: prefixedId('orgLocation').optional(),
})
export type TUpsertSchema = z.infer<typeof ZUpsertSchema>
