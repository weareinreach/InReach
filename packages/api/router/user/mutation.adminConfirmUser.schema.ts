import { z } from 'zod'

export const ZAdminConfirmUserSchema = z.object({ email: z.string().email().toLowerCase() })
export type TAdminConfirmUserSchema = z.infer<typeof ZAdminConfirmUserSchema>
