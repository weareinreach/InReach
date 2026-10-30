import { z } from 'zod'

export const ZAdminResendCodeSchema = z.object({ email: z.string().email().toLowerCase() })
export type TAdminResendCodeSchema = z.infer<typeof ZAdminResendCodeSchema>
