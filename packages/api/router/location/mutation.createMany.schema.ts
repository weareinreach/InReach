import { z } from 'zod'

export const ZCreateManySchema = z.literal('change me')
export type TCreateManySchema = z.infer<typeof ZCreateManySchema>
