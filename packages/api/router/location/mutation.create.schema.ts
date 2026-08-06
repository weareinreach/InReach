import { z } from 'zod'

import * as PrismaEnums from '@weareinreach/db/enums'
import { transformNullString } from '~api/schemas/common'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZCreateSchema = z.object({
	orgId: prefixedId('organization'),
	id: prefixedId('orgLocation').optional(),
	name: z.string(),
	address: z
		.object({
			// Empty string is treated the same as "not provided" - the client always sends an empty
			// string for these until the user (or geocoding) fills in a real value, and these columns
			// should stay NULL rather than storing '' when that never happens.
			street1: z.string().nullish().transform(transformNullString),
			street2: z.string().nullish().transform(transformNullString),
			city: z.string().min(1),
			postCode: z.string().nullish().transform(transformNullString),
			govDistId: z.string(),
			longitude: z.number(),
			latitude: z.number(),
			countryId: z.string().min(1),
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
