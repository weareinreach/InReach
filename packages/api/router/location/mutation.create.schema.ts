import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZCreateSchema = z.object({
	orgId: prefixedId('organization'),
	id: prefixedId('orgLocation').optional(),
	name: z.string().optional(),
	street1: z.string(),
	street2: z.string().optional(),
	city: z.string(),
	postCode: z.string().optional(),
	primary: z.boolean().optional(),
	govDistId: z.string(),
	countryId: z.string(),
	longitude: z.number(),
	latitude: z.number(),
	published: z.boolean().default(false),
	emails: z
		.object({ orgEmailId: prefixedId('orgEmail') })
		.array()
		.optional(),
	phones: z
		.object({ phoneId: prefixedId('orgPhone') })
		.array()
		.optional(),
	services: z
		.object({ serviceId: prefixedId('orgService') })
		.array()
		.optional(),
})

export type TCreateSchema = z.infer<typeof ZCreateSchema>
