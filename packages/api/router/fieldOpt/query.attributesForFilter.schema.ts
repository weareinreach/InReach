import { z } from 'zod'

export const ZAttributesForFilterSchema = z.object({
	canAttachTo: z.enum(['LOCATION', 'ORGANIZATION', 'SERVICE', 'USER']).array().optional(),
})
export type TAttributesForFilterSchema = z.infer<typeof ZAttributesForFilterSchema>
