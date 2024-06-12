import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZCreateSchema = z.object({
	orgId: prefixedId('organization'),
	id: prefixedId('orgLocation').optional(),
	name: z.string(),
	address: z
		.object({
			street1: z.string(),
			street2: z.string().optional(),
			city: z.string(),
			postCode: z.string().optional(),
			govDistId: z.string(),
			longitude: z.number(),
			latitude: z.number(),
			countryId: z.string(),
		})
		.partial()
		.required({ countryId: true }),
	primary: z.boolean().optional(),
	notVisitable: z.boolean().default(false),
	published: z.boolean().default(false),
	emails: prefixedId('orgEmail').array().optional(),
	phones: prefixedId('orgPhone').array().optional(),
	services: prefixedId('orgService').array().optional(),
})

export type TCreateSchema = z.infer<typeof ZCreateSchema>
