import { type TFunction } from 'next-i18next'
import { z } from 'zod'

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

	const getPriceData = () => {
		// Define a schema that precisely matches our data structure, avoiding reliance
		// on complex or non-existent schemas from the generated file.
		const costSchema = z.object({
			min: z.number().optional(),
			max: z.number().optional(),
			currency: z.string().nullish().default('USD'),
		})

		const parsed = costSchema.safeParse(data)

		if (!parsed.success) {
			return null
		}
		const { min, max, currency } = parsed.data

		const formatCurrency = (value: number) =>
			new Intl.NumberFormat(locale, {
				style: 'currency',
				currency: currency || 'USD', // Fallback to 'USD' if currency is null or undefined
			}).format(value)

		if (min !== undefined && max !== undefined) {
			const price = min === max ? formatCurrency(min) : `${formatCurrency(min)} - ${formatCurrency(max)}`
			return { price, from: false, upTo: false }
		}
		if (min !== undefined) {
			return { price: formatCurrency(min), from: true, upTo: false }
		}
		if (max !== undefined) {
			return { price: formatCurrency(max), from: false, upTo: true }
		}
		return null
	}

	// const { price, from, upTo } = getPriceDetails()

	const priceData = getPriceData()
	let translationKey = tsKey
	let translationOptions: Record<string, unknown> = {}

	if (priceData) {
		// const { min, max, currency } = priceData
		const { price, from, upTo } = priceData
		translationOptions = { price }

		if (from) {
			translationKey = 'cost.cost-from'
		} else if (upTo) {
			translationKey = 'cost.cost-upTo'
		} else if (price) {
			translationKey = 'cost.cost-range'
		}
	}
	badgeProps = {
		icon,
		children: t(translationKey, { ...translationOptions, ns: 'attribute', lng: locale }),
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
