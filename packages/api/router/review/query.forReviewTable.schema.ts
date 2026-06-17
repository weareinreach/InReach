import { z } from 'zod'

export const ZForReviewTableSchema = z.void()
export type TForReviewTableSchema = z.infer<typeof ZForReviewTableSchema>
