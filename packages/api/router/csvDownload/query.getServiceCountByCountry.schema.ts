import { z } from 'zod'

export const ZGetServicesCountByCountrySchema = z.void()

export type TGetServicesCountByCountrySchema = z.infer<typeof ZGetServicesCountByCountrySchema>
