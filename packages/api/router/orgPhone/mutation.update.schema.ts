import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpdateSchema = z.object({
	id: prefixedId('orgPhone'),
	orgId: prefixedId('organization'),
	number: z.string().optional(),
	ext: z.string().nullish(),
	primary: z.boolean().optional(),
	published: z.boolean().optional(),
	deleted: z.boolean().optional(),
	countryId: prefixedId('country').optional(),
	phoneTypeId: prefixedId('phoneType').nullish(),
	locationOnly: z.boolean().optional(),
	serviceOnly: z.boolean().optional(),
	description: z.string().nullish(),
})
export type TUpdateSchema = z.infer<typeof ZUpdateSchema>
