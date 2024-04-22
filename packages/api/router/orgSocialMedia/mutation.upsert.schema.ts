import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

const base = z
	.object({
		id: prefixedId('orgSocialMedia'),
		username: z.string(),
		url: z.string(),
		published: z.boolean(),
		deleted: z.boolean(),
		serviceId: z.string(),
		organizationId: prefixedId('organization').nullable(),
		orgLocationId: prefixedId('orgLocation').nullable(),
		orgLocationOnly: z.boolean(),
	})
	.partial()

const create = z
	.object({ operation: z.literal('create') })
	.merge(base.required({ url: true, serviceId: true }))
const update = z
	.object({
		operation: z.literal('update'),
	})
	.merge(base.required({ id: true }))
export const ZUpsertSchema = z.discriminatedUnion('operation', [create, update])
export type TUpsertSchema = z.infer<typeof ZUpsertSchema>
export type Create = z.infer<typeof create>
export type Update = z.infer<typeof update>
