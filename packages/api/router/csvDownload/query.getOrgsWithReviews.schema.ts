import { z } from 'zod'

export const ZGetOrgsWithReviewsSchema = z.void() // Simplified to z.void()

export type TGetOrgsWithReviewsSchema = z.infer<typeof ZGetOrgsWithReviewsSchema>
