import { z } from 'zod'

export const ZForOrgPageSchema = z.object({ slug: z.string(), includeArchived: z.boolean().optional() })
export type TForOrgPageSchema = z.infer<typeof ZForOrgPageSchema>
