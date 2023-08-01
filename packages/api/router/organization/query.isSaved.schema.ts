import { z } from 'zod'

export const ZIsSavedSchema = z.string()
export type TIsSavedSchema = z.infer<typeof ZIsSavedSchema>
