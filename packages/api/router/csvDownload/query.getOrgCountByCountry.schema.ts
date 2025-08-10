import { z } from 'zod'

export const ZGetOrgCountByCountrySchema = z.void()

export type TGetOrgCountByCountrySchema = z.infer<typeof ZGetOrgCountByCountrySchema>
