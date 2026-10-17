import { z } from 'zod'

export const ZGetIntlCrisisSchema = z.object({ cca2: z.string().length(2).toUpperCase() })
export type TGetIntlCrisisSchema = z.infer<typeof ZGetIntlCrisisSchema>
