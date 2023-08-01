import { z } from 'zod'

export const ZSlugRedirectSchema = z.string()
export type TSlugRedirectSchema = z.infer<typeof ZSlugRedirectSchema>
