import { z } from 'zod'

export const ZAdminSetTemporaryPasswordSchema = z.object({ email: z.string().email().toLowerCase() })
export type TAdminSetTemporaryPasswordSchema = z.infer<typeof ZAdminSetTemporaryPasswordSchema>
