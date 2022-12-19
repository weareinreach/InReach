import { Schedule } from '~/datastore/v1/mongodb/output-types/organizations'
import { HoursHelper } from '~/seed/migrate-v1/org/generator'

export const parseSchedule = (schedule: Schedule, helpers: HoursHelper) => {
	const { dayMap, hoursMap, hoursMeta } = helpers
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
			const dayIndex = dayMap.get(day) ?? ''
			if (Object.keys(hours).includes(dayIndex.toString() ?? '')) {
				const time = hoursMap.get(value)
				if (time === undefined) continue
				/* handle 'multi,' '24h,' & 'closed' */
				if (hoursMeta.includes(time)) {
					switch (time) {
						case 'multi': {
							hours[dayIndex].start = '00:00'
							hours[dayIndex].end = '00:00'
							hours[dayIndex].needReview = true
							hours[dayIndex].legacyNote = `multiple times. ${note ?? ''}`.trim()
							break
						}
						case '24h': {
							hours[dayIndex].start = '00:00'
							hours[dayIndex].end = '23:59'
							break
						}
						case 'closed': {
							hours[dayIndex].start = '00:00'
							hours[dayIndex].end = '00:00'
							hours[dayIndex].closed = true
						}
					}
				}
				hours[dayIndex][hourType] = time
				hours[dayIndex].legacyId ??= schedule._id.$oid
				hours[dayIndex].legacyName ??= name
				hours[dayIndex].legacyNote ??= note
				hours[dayIndex].legacyTz = schedule.timezone
			}
		}
	}
	return hours
}

type HoursObj = Record<0 | 1 | 2 | 3 | 4 | 5 | 6, Partial<HoursRecord> | undefined>
type HoursRecord = {
	start: string
	end: string
	legacyId: string
	legacyName: string | undefined
	legacyNote: string | undefined
	legacyTz: string | undefined
	closed: boolean | undefined
	needAssignment: boolean | undefined
	needReview: boolean | undefined
}
