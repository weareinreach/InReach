import { PlaceAutocompleteType } from '@googlemaps/google-maps-services-js'
import { TRPCError } from '@trpc/server'

import { prisma } from '@weareinreach/db'
import { googleMapsApi } from '~api/google'
import { handleError } from '~api/lib/errorHandler'
import { googleAPIResponseHandler } from '~api/lib/googleHandler'
import { geocodeByStringResponse } from '~api/schemas/thirdParty/googleGeo'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCityCoordsSchema } from './query.cityCoords.schema'

const countryMap = new Map<string, string>()
const govDistMap = new Map<string, string>()

const cityCoords = async ({ input }: TRPCHandlerParams<TCityCoordsSchema>) => {
	try {
		const { city, govDist, country } = input
		if (countryMap.size === 0) {
			const countryData = await prisma.country.findMany({
				where: { activeForOrgs: true },
				select: { id: true, cca2: true },
			})
			countryData.forEach((x) => countryMap.set(x.id, x.cca2))
		}
		if (govDist) {
			const govDistData = await prisma.govDist.findMany({
				where: { countryId: country, active: true },
				select: { id: true, name: true },
			})
			govDistData.forEach((x) => govDistMap.set(x.id, x.name))
		}
		const searchCountry = country ? countryMap.get(country) : undefined
		if (!searchCountry) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Country not found',
			})
		}
		const searchGovDist = govDist ? govDistMap.get(govDist) : undefined
		const searchString = [city, searchGovDist, searchCountry].filter(Boolean).join(', ')
		const { data } = await googleMapsApi.geocode({
			params: {
				// eslint-disable-next-line node/no-process-env
				key: process.env.GOOGLE_PLACES_API_KEY as string,
				address: searchString,
				components: PlaceAutocompleteType.cities,
				region: searchCountry,
			},
		})

		const parsedData = geocodeByStringResponse.parse(data)

		return googleAPIResponseHandler(parsedData, data)
	} catch (error) {
		return handleError(error)
	}
}
export default cityCoords
