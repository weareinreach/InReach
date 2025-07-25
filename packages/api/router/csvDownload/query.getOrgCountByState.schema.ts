import { z } from 'zod'

export const ZGetOrgCountByStateSchema = z.void()

export type TGetOrgCountByStateSchema = z.infer<typeof ZGetOrgCountByStateSchema>
