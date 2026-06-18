import { z } from 'zod'

export const ZToggleHandledSchema = z.object({
	id: z.string(),
	handled: z.boolean(),
})

export type TToggleHandledSchema = z.infer<typeof ZToggleHandledSchema>
