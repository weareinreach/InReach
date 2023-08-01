import { z } from 'zod'

export const ZGetFeatureFlagSchema = z.enum(['useTabsOnHomeSearch'])
export type TGetFeatureFlagSchema = z.infer<typeof ZGetFeatureFlagSchema>
