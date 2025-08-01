import { z } from 'zod'

export const ZGetServicesCountByCountryStateSchema = z.void()

export type TGetServicesCountByCountryStateSchema = z.infer<typeof ZGetServicesCountByCountryStateSchema>
