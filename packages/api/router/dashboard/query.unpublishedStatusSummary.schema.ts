import { z } from 'zod'

export const ZUnpublishedStatusSummarySchema = z.void()

export type TUnpublishedStatusSummarySchema = z.infer<typeof ZUnpublishedStatusSummarySchema>
