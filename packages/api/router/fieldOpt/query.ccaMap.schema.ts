import { z } from 'zod'

export const ZCcaMapSchema = z.object({ activeForOrgs: z.boolean().optional() })
export type TCcaMapSchema = z.infer<typeof ZCcaMapSchema>
