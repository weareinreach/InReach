import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpdateSchema = z.object({
	id: prefixedId('orgEmail'),
	orgId: prefixedId('organization'),
	firstName: z.string().nullish(),
	lastName: z.string().nullish(),
	primary: z.boolean().optional(),
	email: z.string().optional(),
	published: z.boolean().optional(),
	deleted: z.boolean().optional(),
	titleId: prefixedId('userTitle').nullish(),
	locationOnly: z.boolean().optional(),
	serviceOnly: z.boolean().optional(),
	description: z.string().nullish(),
	descriptionId: z.string().nullish(),
})
export type TUpdateSchema = z.infer<typeof ZUpdateSchema>
