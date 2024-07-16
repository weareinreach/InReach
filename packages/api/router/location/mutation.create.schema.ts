import { z } from 'zod'

import * as PrismaEnums from '@weareinreach/db/enums'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZCreateSchema = z.object({
	orgId: prefixedId('organization'),
	id: prefixedId('orgLocation').optional(),
	name: z.string(),
	address: z
		.object({
			street1: z.string().optional(),
			street2: z.string().optional(),
			city: z.string(),
			postCode: z.string().optional(),
			govDistId: z.string(),
			longitude: z.number(),
			latitude: z.number(),
			countryId: z.string(),
		})
		.partial()
		.required({ countryId: true, city: true }),
	primary: z.boolean().optional(),
	addressVisibility: z.nativeEnum(PrismaEnums.AddressVisibility),
	published: z.boolean().default(false),
	emails: prefixedId('orgEmail').array().optional(),
	phones: prefixedId('orgPhone').array().optional(),
	services: prefixedId('orgService').array().optional(),
})

export type TCreateSchema = z.infer<typeof ZCreateSchema>
