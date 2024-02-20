import { z } from 'zod'

export const ZGetServiceTypesSchema = z
	.object({ active: z.boolean(), internal: z.boolean() })
	.partial()
	.default({ active: true, internal: false })
export type TGetServiceTypesSchema = z.infer<typeof ZGetServiceTypesSchema>
