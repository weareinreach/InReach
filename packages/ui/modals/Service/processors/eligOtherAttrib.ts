import { type TFunction } from 'next-i18next'

import { getFreeText } from '~ui/hooks/useFreeText'

import { type AttributeRecord } from '../types'

export const processEligOtherAttrib = (record: AttributeRecord, t: TFunction): EligOtherAttribReturn => {
	const { text, supplementId: id, active } = record
	if (!text) {
		return null
	}
	const { key, options } = getFreeText(text)

	return {
		id,
		active,
		childProps: {
			children: t(key, options),
		},
		editable: true,
	}
}

export interface EligOtherAttribOutput {
	id: string
	childProps: {
		children: string
	}
	active: boolean
	editable: boolean
}
export type EligOtherAttribReturn = EligOtherAttribOutput | null
