import { accessInstructions } from '@weareinreach/db/zod_util/attributeSupplement'

import { type AccessDetailRecord } from '../types'

export const processEmailAccess = (record: AccessDetailRecord): EmailAccessReturn => {
	const parsed = accessInstructions.email.safeParse(record.data)
	if (!parsed.success || !parsed.data.access_value) {
		return null
	}
	const { supplementId: id, active } = record
	const { access_value } = parsed.data
	return {
		id,
		active,
		title: null,
		description: null,
		email: access_value,
		// legacyDesc: parsed.data.instructions,
		// firstName: null,
		// lastName: null,
		primary: false,
		locationOnly: false,
		serviceOnly: false,
	}
}

export interface EmailAccessOutput {
	id: string
	title: { key: string } | null
	description: { key: string; defaultText: string } | null
	email: string
	primary: boolean
	locationOnly: boolean
	serviceOnly: boolean
	active: boolean
}
export type EmailAccessReturn = EmailAccessOutput | null
