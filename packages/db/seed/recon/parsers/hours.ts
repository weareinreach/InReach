import { DateTime, Interval } from 'luxon'
import superjson from 'superjson'
import invariant from 'tiny-invariant'

import fs from 'fs'
import path from 'path'

import { type Prisma } from '~db/client'
import { JsonInputOrNull } from '~db/zod_util/prismaJson'

const hoursCorrections = {
	hours: superjson.parse<Map<string, string | undefined>>(
		fs.readFileSync(path.resolve(__dirname, `../corrections/hours.json`), 'utf-8')
	),
	days: new Map<string, 0 | 1 | 2 | 3 | 4 | 5 | 6>([
		['sunday', 0],
		['monday', 1],
		['tuesday', 2],
		['wednesday', 3],
		['thursday', 4],
		['friday', 5],
		['saturday', 6],
	]),
	meta: ['multi', '24h', 'closed'],
	tz: new Map([
		['PST', 'America/Los_Angeles'],
		['MST', 'America/Denver'],
		['CST', 'America/Chicago'],
		['EST', 'America/New_York'],
		['PDT', 'America/Los_Angeles'],
		['EDT', 'America/New_York'],
		['MDT', 'America/Denver'],
		['AST', 'America/Anchorage'],
		['NST', 'America/St_Johns'],
		['CDT', 'America/Chicago'],
		['HST', 'Pacific/Honolulu'],
		['AKST', 'America/Anchorage'],
	]),
}
export const parseSchedule = (schedule: Schedule) => {
	const regexStart = /.*_start/i
	const regexEnd = /.*_end/i
	const hours: HoursObj = {
		0: {},
		1: {},
		2: {},
		3: {},
		4: {},
		5: {},
		6: {},
	}
	const { name, note } = schedule
	for (const [key, value] of Object.entries(schedule)) {
		if (regexStart.test(key) || regexEnd.test(key)) {
			const [day, hourType] = key.split('_')
			if (!day || !hourType) continue
			const dayIndex = hoursCorrections.days.get(day)
			invariant(dayIndex !== undefined)
			const record = hours[dayIndex]
			if (record === undefined) {
				throw new Error('Unable to set record')
			}
			if (Object.keys(hours).includes(dayIndex?.toString())) {
				const time = hoursCorrections.hours.get(value)
				if (time === undefined) continue
				const zone = hoursCorrections.tz.get(schedule.timezone ?? '')
				/* handle 'multi,' '24h,' & 'closed' */
				if (hoursCorrections.meta.includes(time)) {
					switch (time) {
						case 'multi': {
							record.start = DateTime.fromFormat('00:00', 'HH:mm', { zone }).toJSDate()
							record.end = DateTime.fromFormat('00:00', 'HH:mm', { zone }).toJSDate()
							record.needReview = true
							record.legacyNote = `multiple times (${value}) ${note ?? ''}`.trim()
							break
						}
						case '24h': {
							record.start = DateTime.fromFormat('00:00', 'HH:mm', { zone }).toJSDate()
							record.end = DateTime.fromFormat('23:59', 'HH:mm', { zone }).toJSDate()
							record.open24hours = true
							break
						}
						case 'closed': {
							record.start = DateTime.fromFormat('00:00', 'HH:mm', { zone }).toJSDate()
							record.end = DateTime.fromFormat('00:00', 'HH:mm', { zone }).toJSDate()
							record.closed = true
							break
						}
					}
				} else {
					record[hourType] = DateTime.fromFormat(time, 'HH:mm', { zone }).toJSDate()
				}
				record.legacyId ??= schedule._id.$oid
				record.legacyName ??= name
				record.legacyNote ??= note
				record.legacyTz = schedule.timezone
				record.tz = hoursCorrections.tz.get(schedule.timezone ?? '')
				if (record.start instanceof Date && record.end instanceof Date) {
					record.interval = JsonInputOrNull.parse(
						superjson.serialize(
							Interval.fromDateTimes(
								DateTime.fromJSDate(record.start, { zone }),
								DateTime.fromJSDate(record.end, { zone })
							)
						)
					)
				}
			}
		}
	}
	return hours
}

type HoursObj = Record<
	0 | 1 | 2 | 3 | 4 | 5 | 6,
	Partial<Prisma.OrgHoursCreateManyInput | Prisma.OrgHoursUpdateInput> | undefined
>
interface Schedule {
	_id: { $oid: string }
	monday_start?: string
	monday_end?: string
	tuesday_start?: string
	tuesday_end?: string
	wednesday_start?: string
	wednesday_end?: string
	thursday_start?: string
	thursday_end?: string
	friday_start?: string
	friday_end?: string
	saturday_start?: string
	saturday_end?: string
	sunday_start?: string
	sunday_end?: string
	name?: string
	timezone?: string
	note?: string
}
