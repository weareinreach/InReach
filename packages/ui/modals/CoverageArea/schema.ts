import { z } from 'zod'

const Country = z.object({
	id: z.string(),
	cca2: z.string(),
})

const GovDist = z.object({
	id: z.string(),
	country: z.object({ cca2: z.string() }),
	tsKey: z.string(),
	tsNs: z.string(),
	parent: z
		.object({
			tsKey: z.string(),
			tsNs: z.string(),
		})
		.nullable(),
})

export const ServiceAreaForm = z.object({
	id: z.string(),
	countries: Country.array(),
	districts: GovDist.array(),
})

export type ZServiceAreaForm = z.infer<typeof ServiceAreaForm>
