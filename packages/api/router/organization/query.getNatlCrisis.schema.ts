import { z } from 'zod'

export const ZGetNatlCrisisSchema = z.object({ cca2: z.string().length(2) })
export type TGetNatlCrisisSchema = z.infer<typeof ZGetNatlCrisisSchema>
