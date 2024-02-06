import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZLocationEditUpdateSchema = z.object({
	id: prefixedId('orgLocation'),
	name: z.string().nullish(),
	services: z.object({
		createdVals: prefixedId('orgService').array().nullable(),
		deletedVals: prefixedId('orgService').array().nullable(),
	}),
})
export type TLocationEditUpdateSchema = z.infer<typeof ZLocationEditUpdateSchema>
