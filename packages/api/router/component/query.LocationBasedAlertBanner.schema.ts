import { z } from 'zod'

export const ZLocationBasedAlertBannerSchema = z.object({
	lat: z.number(),
	lon: z.number(),
})
export type TLocationBasedAlertBannerSchema = z.infer<typeof ZLocationBasedAlertBannerSchema>
