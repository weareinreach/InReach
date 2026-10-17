import { z } from 'zod'

export const ZSearchTypeaheadSchema = z.object({ search: z.string().min(2) })
export type TSearchTypeaheadSchema = z.infer<typeof ZSearchTypeaheadSchema>
