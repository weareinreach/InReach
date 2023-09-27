import { DateTime, Interval } from 'luxon'
import sj from 'superjson/dist'

sj.registerCustom(
	{
		isApplicable: (v: unknown): v is DateTime => DateTime.isDateTime(v),
		serialize: (v: DateTime) => v.toJSON() as string,
		deserialize: (v: string) => DateTime.fromISO(v),
	},
	'DateTime'
)

sj.registerCustom(
	{
		isApplicable: (v: unknown): v is Interval => Interval.isInterval(v),
		serialize: (v: Interval) => v.toISO(),
		deserialize: (v: string) => Interval.fromISO(v),
	},
	'Interval'
)

export { sj as superjson }
