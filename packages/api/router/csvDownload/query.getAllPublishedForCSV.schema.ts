import { z } from 'zod'

export const ZGetAllPublishedForCSVSchema = z.void() // Simplified to z.void()

export type TGetAllPublishedForCSVSchema = z.infer<typeof ZGetAllPublishedForCSVSchema>
