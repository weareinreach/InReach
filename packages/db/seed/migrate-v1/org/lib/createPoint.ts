import { point } from '@turf/helpers'

export const createPoint = ({ longitude, latitude }: CreatePointArgs) => {
	if (!longitude || !latitude) return 'JsonNull'
	return point([longitude, latitude]).geometry
}

type CreatePointArgs = {
	longitude: number | undefined
	latitude: number | undefined
}
