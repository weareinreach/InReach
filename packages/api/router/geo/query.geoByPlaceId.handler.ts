/* eslint-disable node/no-process-env */
import { googleMapsApi } from '~api/google'
import { googleAPIResponseHandler } from '~api/lib/googleHandler'
import { geocodeByPlaceIdResponse } from '~api/schemas/thirdParty/googleGeo'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGeoByPlaceIdSchema } from './query.geoByPlaceId.schema'

const geoByPlaceId = async ({ input }: TRPCHandlerParams<TGeoByPlaceIdSchema>) => {
	const { data } = await googleMapsApi.geocode({
		params: {
			key: process.env.GOOGLE_PLACES_API_KEY as string,
			place_id: input,
		},
	})
	const parsedData = geocodeByPlaceIdResponse.parse(data)
	return googleAPIResponseHandler(parsedData, data)
}
export default geoByPlaceId
