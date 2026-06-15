import { z } from 'zod'

export const getPotentialMatchesSchema = z.object({
	name: z.string().optional(),
	website: z.string().optional(),
})

export type TGetPotentialMatchesSchema = z.infer<typeof getPotentialMatchesSchema>
