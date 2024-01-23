import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpdateAttributesBasicSchema = z.object({
	id: prefixedId('organization'),
	createdVals: z.string().array().nullable(),
	deletedVals: z.string().array().nullable(),
})
export type TUpdateAttributesBasicSchema = z.infer<typeof ZUpdateAttributesBasicSchema>
