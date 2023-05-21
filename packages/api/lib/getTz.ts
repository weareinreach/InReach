import { find } from 'geo-tz'

export const getTz = ({ lat, lon }: { lat: number; lon: number }) => find(lat, lon)[0]
