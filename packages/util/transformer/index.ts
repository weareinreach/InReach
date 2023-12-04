import { DateTime, Interval } from 'luxon'
import superjson from 'superjson'

superjson.registerCustom<DateTime, string>(
	{
		isApplicable: DateTime.isDateTime,
		serialize: (v) => v.toJSON() ?? '',
		deserialize: (v) => DateTime.fromISO(v),
	},
	'LuxonDateTime'
)
superjson.registerCustom(
	{
		isApplicable: Interval.isInterval,
		serialize: (v) => v.toISO() ?? '',
		deserialize: (v) => Interval.fromISO(v),
	},
	'LuxonInterval'
)

export { type SuperJSONResult } from 'superjson/dist/types'
export const transformer = superjson
export { superjson }
