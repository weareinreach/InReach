import { z } from 'zod'

export const ZForOrgPageEditsSchema = z.object({ slug: z.string() })
export type TForOrgPageEditsSchema = z.infer<typeof ZForOrgPageEditsSchema>
