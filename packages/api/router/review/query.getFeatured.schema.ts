import { z } from 'zod'

export const ZGetFeaturedSchema = z.number()
export type TGetFeaturedSchema = z.infer<typeof ZGetFeaturedSchema>
