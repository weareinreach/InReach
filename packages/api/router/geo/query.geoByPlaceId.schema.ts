import { z } from 'zod'

export const ZGeoByPlaceIdSchema = z.string()
export type TGeoByPlaceIdSchema = z.infer<typeof ZGeoByPlaceIdSchema>
