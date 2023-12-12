import { z } from 'zod'

export const ServiceAreaForm = z.object({
	id: z.string(),
	countries: z.string().array(),
	districts: z.string().array(),
})

export type ZServiceAreaForm = z.infer<typeof ServiceAreaForm>
