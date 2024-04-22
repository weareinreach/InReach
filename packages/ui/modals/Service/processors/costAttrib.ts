import { type TFunction } from 'next-i18next'

import { attributeSupplementSchema } from '@weareinreach/db/generated/attributeSupplementSchema'
import { getFreeText } from '~ui/hooks/useFreeText'
import { isValidIcon } from '~ui/icon'

import { type AttributeRecord } from '../types'

export const processCostAttrib = (
	record: AttributeRecord,
	t: TFunction,
	locale: string
): CostAttribReturn => {
	const { text, data, supplementId: id, active, icon, tsKey, tsNs } = record
	if (!isValidIcon(icon)) {
		return null
	}
	let badgeProps = null
	let detailProps = null
	if (text) {
		const { key, options } = getFreeText(text, { lng: locale })
		detailProps = {
			children: t(key, options),
		}
	}

	const getPriceDetails = () => {
		const parsed = attributeSupplementSchema.currency.safeParse(data)
		if (!parsed.success) {
			return undefined
		}
		const { cost, currency } = parsed.data
		const formatted = new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: currency ?? undefined,
		}).format(cost)
		return formatted
	}
	badgeProps = {
		icon,
		children: t(tsKey, { price: getPriceDetails(), ns: tsNs, lng: locale }),
	}

	return {
		id,
		active,
		badgeProps,
		detailProps,
		editable: true,
	}
}

export interface CostAttribOutput {
	id: string
	badgeProps: {
		icon: string
		children: string
	} | null
	detailProps: {
		children: string
	} | null
	active: boolean
	editable: boolean
}
export type CostAttribReturn = CostAttribOutput | null
