import { z } from 'zod'

export const ZGetOneSchema = z.object({ id: z.string() }).or(z.object({ tag: z.string() }))
export type TGetOneSchema = z.infer<typeof ZGetOneSchema>
