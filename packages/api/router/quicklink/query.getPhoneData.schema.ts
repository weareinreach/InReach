import { z } from 'zod'

export const ZGetPhoneDataSchema = z.object({ limit: z.number(), skip: z.number().optional() })
export type TGetPhoneDataSchema = z.infer<typeof ZGetPhoneDataSchema>
