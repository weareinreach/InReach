import { DateTime, Interval } from 'luxon'
import superjson from 'superjson'

superjson.registerCustom<DateTime, string>(
	{
		isApplicable: DateTime.isDateTime,
		serialize: (v) => v.toJSON() ?? '',
		deserialize: (v) => DateTime.fromISO(v),
	},
	'Luxon DateTime'
)
superjson.registerCustom(
	{
		isApplicable: Interval.isInterval,
		serialize: (v) => v.toISO() ?? '',
		deserialize: (v) => Interval.fromISO(v),
	},
	'Luxon Interval'
)

export { type SuperJSONResult } from 'superjson/dist/types'
export const transformer = superjson
