import { z } from 'zod'

export const ZGetOrgCountByCountryAttributeSchema = z.void()

export type TGetOrgCountByCountryAttributeSchema = z.infer<typeof ZGetOrgCountByCountryAttributeSchema>
