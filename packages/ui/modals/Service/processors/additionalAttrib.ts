import { type TFunction } from 'next-i18next'

import { isValidIcon } from '~ui/icon'

import { type AttributeRecord } from '../types'

const hasSupplementalData = (...args: unknown[]) => args.some((x) => x !== null && x !== undefined)

export const processAdditionalAttrib = (
	record: AttributeRecord,
	t: TFunction,
	locale: string,
	isEditMode: boolean
): AdditionalAttribReturn => {
	const lng = locale
	const {
		supplementId: id,
		active,
		icon,
		tsKey,
		tsNs,
		boolean,
		text,
		data,
		countryId,
		govDistId,
		languageId,
	} = record
	const basicOutput: Pick<AdditionalAttribOutput, 'id' | 'active' | 'atCapacity'> = {
		id,
		active,
	}

	let badgeProps = null
	let detailProps = null
	const editable = hasSupplementalData(boolean, text, data, countryId, govDistId, languageId)
	if (tsKey.includes('at-capacity')) {
		if (isEditMode) {
			badgeProps = {
				icon: 'carbon:close-filled',
				children: t('service.at-capacity', { ns: 'common', lng }),
				color: 'red',
			}
		}
		basicOutput.atCapacity = true
	} else if (!isValidIcon(icon)) {
		detailProps = {
			children: t(tsKey, { ns: tsNs, lng }),
		}
	} else {
		badgeProps = {
			icon,
			children: t(tsKey, { ns: tsNs, lng }),
		}
	}
	return {
		...basicOutput,
		badgeProps,
		detailProps,
		editable,
	}
}

export interface AdditionalAttribOutput {
	id: string
	active: boolean
	badgeProps: {
		icon: string
		children: string
		color?: string
	} | null
	detailProps: {
		children: string
	} | null
	atCapacity?: boolean
	editable: boolean
}
export type AdditionalAttribReturn = AdditionalAttribOutput | null
