import { type TFunction } from 'next-i18next'

import { type AttributeRecord } from '../types'

export const processSrvFocusAttrib = (
	record: AttributeRecord,
	t: TFunction,
	isEditMode: boolean = false
): SrvFocusAttribReturn => {
	const { tsKey, icon, tsNs, supplementId: id, active } = record
	// When not in edit mode, only show the tag if it is top level.
	const isDisplayable = isEditMode || record._count.parents === 0
	if (typeof icon === 'string' && isDisplayable) {
		return {
			id,
			active,
			childProps: {
				icon,
				children: t(tsKey, { ns: tsNs }),
			},
		}
	}
	return null
}

export interface SrvFocusAttribOutput {
	id: string
	childProps: {
		icon: string
		children: string
	}
	active: boolean
}
export type SrvFocusAttribReturn = SrvFocusAttribOutput | null
