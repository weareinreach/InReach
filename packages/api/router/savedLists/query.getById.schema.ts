import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetByIdInputSchema = z.object({
	id: z.string(),
})

export type TGetByIdInputSchema = z.infer<typeof ZGetByIdInputSchema>
