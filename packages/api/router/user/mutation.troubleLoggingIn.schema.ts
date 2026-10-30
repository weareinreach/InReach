import { z } from 'zod'

export const ZTroubleLoggingInSchema = z.object({ email: z.string().email().toLowerCase() })
export type TTroubleLoggingInSchema = z.infer<typeof ZTroubleLoggingInSchema>
