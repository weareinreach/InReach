import { z } from 'zod'

export const ZGetServicesCountByCountryStatePostalCodeSchema = z.void()

export type TGetServicesCountByCountryStatePostalCodeSchema = z.infer<
	typeof ZGetServicesCountByCountryStatePostalCodeSchema
>
