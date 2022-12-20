import { point } from '@turf/helpers'

export const createPoint = ({ longitude, latitude }: CreatePointArgs) => {
	if (!longitude || !latitude) return {}
	return point([longitude, latitude])
}

type CreatePointArgs = {
	longitude: number | undefined
	latitude: number | undefined
}
