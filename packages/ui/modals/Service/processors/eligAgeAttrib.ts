import { type TFunction } from 'next-i18next'

import { attributeSupplementSchema } from '@weareinreach/db/generated/attributeSupplementSchema'

import { type AttributeRecord } from '../types'

export const processEligAgeAttrib = (
	record: AttributeRecord,
	t: TFunction,
	locale: string
): EligAgeAttribReturn => {
	const lng = locale
	const { data, supplementId: id, active } = record
	const parsed = attributeSupplementSchema.numMinMaxOrRange.safeParse(data)
	if (!parsed.success) {
		return null
	}
	const { min, max } = parsed.data
	const getContext = (): 'min' | 'max' | 'range' => {
		if (min && max) {
			return 'range'
		} else if (min && !max) {
			return 'min'
		} else {
			return 'max'
		}
	}

	return {
		id,
		active,
		children: t('service.elig-age', { ns: 'common', context: getContext(), min, max, lng }),
		editable: true,
	}
}

export interface EligAgeAttribOutput {
	id: string
	children: string
	active: boolean
	editable: boolean
}
export type EligAgeAttribReturn = EligAgeAttribOutput | null
