import { type TFunction } from 'next-i18next'

import { getFreeText } from '~ui/hooks/useFreeText'

import { type AttributeRecord } from '../types'

export const processTargetPopAttrib = (
	record: AttributeRecord,
	t: TFunction,
	locale: string
): TargetPopAttribReturn => {
	const lng = locale
	const { text, supplementId: id, active } = record
	if (!text) {
		return null
	}
	const { key, options } = getFreeText(text, { lng })

	return {
		id,
		active,
		childProps: {
			children: t(key, options),
		},
		editable: true,
	}
}

export interface TargetPopAttribOutput {
	id: string
	childProps: {
		children: string
	}
	active: boolean
	editable: boolean
}
export type TargetPopAttribReturn = TargetPopAttribOutput | null
