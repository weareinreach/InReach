import { z } from 'zod'

export const ZEditModeBarReverifySchema = z.object({ slug: z.string() })
export type TEditModeBarReverifySchema = z.infer<typeof ZEditModeBarReverifySchema>
