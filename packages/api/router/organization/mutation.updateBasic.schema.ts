import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpdateBasicSchema = z.object({
	id: prefixedId('organization'),
	name: z.string().optional(),
	description: z.string().optional(),
})

export type TUpdateBasicSchema = z.infer<typeof ZUpdateBasicSchema>
