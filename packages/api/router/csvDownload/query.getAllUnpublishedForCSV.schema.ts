import { z } from 'zod'

export const ZGetAllUnpublishedForCSVSchema = z.void() // Simplified to z.void()

export type TGetAllUnpublishedForCSVSchema = z.infer<typeof ZGetAllUnpublishedForCSVSchema>
