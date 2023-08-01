import { z } from 'zod'

export const ZCheckForExistingSchema = z.string().trim()
export type TCheckForExistingSchema = z.infer<typeof ZCheckForExistingSchema>
