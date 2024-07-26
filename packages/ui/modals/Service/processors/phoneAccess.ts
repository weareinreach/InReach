import { accessInstructions } from '@weareinreach/db/zod_util/attributeSupplement'

import { type AccessDetailRecord, type LocationsAPI } from '../types'

export const processPhoneAccess = (
	record: AccessDetailRecord,
	locations: NonNullable<LocationsAPI>
): PhoneAccessReturn => {
	const parsed = accessInstructions.phone.safeParse(record.data)
	const country = locations.find(({ location }) => Boolean(location.country))?.location?.country?.cca2
	if (!parsed.success || !parsed.data.access_value || !country) {
		return null
	}
	const { supplementId: id, active } = record
	const { access_value } = parsed.data
	return {
		id,
		active,
		country,
		number: access_value,
		phoneType: null,
		primary: false,
		locationOnly: false,
		ext: null,
		description: null,
	}
}

export interface PhoneAccessOutput {
	id: string
	country: string
	number: string
	phoneType: { key: string; defaultText: string } | null
	primary: boolean
	locationOnly: boolean
	ext: string | null
	description: { key: string; defaultText: string } | null
	active: boolean
}
export type PhoneAccessReturn = PhoneAccessOutput | null
