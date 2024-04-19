import { type TFunction } from 'next-i18next'

import { getFreeText } from '~ui/hooks/useFreeText'

import { type AccessDetailRecord } from '../types'

export const processPublicTransit = (
	record: AccessDetailRecord,
	t: TFunction,
	locale: string
): PublicTransitReturn => {
	const lng = locale
	const { text, active, supplementId } = record
	if (!text) {
		return null
	}
	const { key, options } = getFreeText(text, { lng })

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
