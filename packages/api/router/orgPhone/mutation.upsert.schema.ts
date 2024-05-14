import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

const base = z
	.object({
		id: prefixedId('orgPhone'),
		orgId: prefixedId('organization'),
		number: z.string(),
		ext: z.string().nullable(),
		primary: z.boolean(),
		published: z.boolean(),
		deleted: z.boolean(),
		countryId: prefixedId('country'),
		phoneTypeId: prefixedId('phoneType').nullable(),
		locationOnly: z.boolean(),
		serviceOnly: z.boolean(),
		description: z.string().nullable(),
	})
	.partial()

const create = z
	.object({
		operation: z.literal('create'),
	})
	.merge(base.required({ number: true, countryId: true }))
const update = z
	.object({
		operation: z.literal('update'),
	})
	.merge(base.required({ id: true }))
export type Create = z.infer<typeof create>
export type Update = z.infer<typeof update>
export const ZUpsertSchema = z.discriminatedUnion('operation', [create, update])
export type TUpsertSchema = z.infer<typeof ZUpsertSchema>
