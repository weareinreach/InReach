import { z } from 'zod'

export const ZGetServicesCountByCountryAttributeSchema = z.void()

export type TGetServicesCountByCountryAttributeSchema = z.infer<
	typeof ZGetServicesCountByCountryAttributeSchema
>
