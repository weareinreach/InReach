import { DateTime, Interval } from 'luxon'
import superjson, { type SuperJSONResult } from 'superjson'

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
export const isSuperJSONResult = (data: unknown): data is SuperJSONResult =>
	!!data && typeof data === 'object' && !Array.isArray(data) && 'json' in data

export { type SuperJSONResult } from 'superjson/dist/types'
export const transformer = superjson
export { superjson }
