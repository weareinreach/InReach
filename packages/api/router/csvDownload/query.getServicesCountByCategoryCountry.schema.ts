import { z } from 'zod'

export const ZGetServicesCountByCategoryCountrySchema = z.void()

export type TGetServicesCountByCategoryCountrySchema = z.infer<
	typeof ZGetServicesCountByCategoryCountrySchema
>
