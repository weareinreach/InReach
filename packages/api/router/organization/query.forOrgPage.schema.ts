import { z } from 'zod'

export const ZForOrgPageSchema = z.object({ slug: z.string() })
export type TForOrgPageSchema = z.infer<typeof ZForOrgPageSchema>
