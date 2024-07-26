import { accessInstructions } from '@weareinreach/db/zod_util/attributeSupplement'

import { type AccessDetailRecord } from '../types'

export const processLinkAccess = (record: AccessDetailRecord): LinkAccessReturn => {
	const parsed = accessInstructions.link.safeParse(record.data)
	if (!parsed.success || !parsed.data.access_value) {
		return null
	}
	const { supplementId: id, active } = record
	const { access_value } = parsed.data
	return {
		id,
		active,
		description: null,
		isPrimary: false,
		// orgLocationId: null,
		orgLocationOnly: false,
		url: access_value,
	}
}

export interface LinkAccessOutput {
	id: string
	description: { key: string; defaultText: string } | null
	url: string
	isPrimary: boolean
	orgLocationOnly: boolean
	active: boolean
}
export type LinkAccessReturn = LinkAccessOutput | null
