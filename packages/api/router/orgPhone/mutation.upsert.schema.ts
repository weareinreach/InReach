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
		// Create only: the location the phone was added from. Linked in the same transaction as the create,
		// so the phone can't end up saved without it (#2100). Ignored on update - linking or unlinking an
		// existing phone goes through `orgPhone.locationLink`.
		orgLocationId: prefixedId('orgLocation').nullable(),
	})
	.partial()

const create = z
	.object({
		operation: z.literal('create'),
	})
	.merge(base.required({ number: true, countryId: true, orgId: true }))
const update = z
	.object({
		operation: z.literal('update'),
	})
	.merge(base.required({ id: true }))
export type Create = z.infer<typeof create>
export type Update = z.infer<typeof update>
export const ZUpsertSchema = z.discriminatedUnion('operation', [create, update])
export type TUpsertSchema = z.infer<typeof ZUpsertSchema>
