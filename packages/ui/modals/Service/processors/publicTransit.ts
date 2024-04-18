import { type TFunction } from 'next-i18next'

import { getFreeText } from '~ui/hooks/useFreeText'

import { type AccessDetailRecord } from '../types'

export const processPublicTransit = (record: AccessDetailRecord, t: TFunction): PublicTransitReturn => {
	const { text, active, supplementId } = record
	if (!text) {
		return null
	}
	const { key, options } = getFreeText(text)

	return {
		id: supplementId,
		children: t(key, options),
		editable: true,
		active,
	}
}

export interface PublicTransitOutput {
	id: string
	children: string
	active: boolean
	editable: boolean
}
export type PublicTransitReturn = PublicTransitOutput | null
