import { z } from 'zod'

export const ZGetServicesCountByCategoryStateCountrySchema = z.void()

export type TGetServicesCountByCategoryStateCountrySchema = z.infer<
	typeof ZGetServicesCountByCategoryStateCountrySchema
>
