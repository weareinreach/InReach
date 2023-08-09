/* eslint-disable node/no-process-env */
import { googleMapsApi } from '~api/google'
import { googleAPIResponseHandler } from '~api/lib/googleHandler'
import { geocodeResponse } from '~api/schemas/thirdParty/googleGeo'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGeoByPlaceIdSchema } from './query.geoByPlaceId.schema'

export const geoByPlaceId = async ({ input }: TRPCHandlerParams<TGeoByPlaceIdSchema>) => {
	const { data } = await googleMapsApi.geocode({
		params: {
			key: process.env.GOOGLE_PLACES_API_KEY as string,
			place_id: input,
		},
	})
	const parsedData = geocodeResponse.parse(data)
	return googleAPIResponseHandler(parsedData, data)
}
