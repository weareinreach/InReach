import { z } from 'zod'

export const ZDeleteAccountSchema = z.string()
export type TDeleteAccountSchema = z.infer<typeof ZDeleteAccountSchema>
