import { z } from 'zod'

import { tagDataMaps } from './tagDataMaps'

import { TagHelper } from '~db/seed/migrate-v1/org/generator'
import { type InputJsonValueType } from '~db/zod_util/prismaJson'
/**
 * It takes a value, converts it to a string, converts that string to lowercase, and then returns true if the
 * string is "yes" or "true", false if it's "no" or "false", and undefined if it's "unknown"
 *
 * @param val - Typeof value
 * @returns A function that takes a value and returns a boolean.
 */
const isTruthy = (val: string | boolean | number | undefined | unknown[]) => {
	const check = val?.toString().toLocaleLowerCase()
	if (check === 'unknown') return undefined
	if (check === 'yes' || check === 'true') return true
	return false
}

/**
 * > It takes a tag and a value, and returns an object with the attribute record, the data, and the type of
 * > attribute
 *
 * @param tag - The tag that is being checked
 * @param value - The value of the tag.
 * @returns An object with a type, data, and attribute property.
 */
type TagCheckParams = {
	tag: string
	value: string | number | boolean
	helpers: TagHelper
}

/**
 * It takes a string, splits it into an array, discards the first element ('service'), separates out the
 * second element ('county', 'national', or 'state), joins the remaining elements (the region), and then uses
 * the result to find a matching record in an array. Any 'city' records are discarded and loaded to
 * 'unsupported attributes'
 *
 * @param {string} tag - The tag that was clicked on
 * @returns The ID of the service area
 */
const getAreaRecord = (tag: string, helpers: TagHelper) => {
	const { countryNameMap, distList } = helpers
	const tagBreakdown = tag.split('-')
	tagBreakdown.shift()
	const type = tagBreakdown.shift()
	const search = tagBreakdown.join('-')
	const state = new RegExp(`\\w{2}-${search}`, 'gi')
	const county = new RegExp(`\\w{2}-${search}-.*`, 'gi')
	if (type === 'city') return undefined
	if (type === 'national') {
		const result = countryNameMap.get(search.replace('-', ' '))
		return {
			type: 'country' as const,
			id: result?.id,
			name: result?.name,
		}
	}
	const result = distList.find((x) => x.slug.match(type === 'county' ? county : state))
	return {
		type: 'dist' as const,
		id: result?.id,
		name: result?.name,
	}
}
export const tagCheck: TagCheck = ({ tag, value, helpers }) => {
	const { attributeList, langMap } = helpers
	const speakerRegex = /community-(.+)-speakers/i
	const langRegex = /lang-(.+)/i
	const areaRegex = /service-(?:county|national|state)-(.+)/i
	const ageRegex = /elig-age.*/i

	/**
	 * It creates a new object with a type of `unknown` and an attribute of `incompatible-info` and a data
	 * object with a single key of `tag` and a value of `value`
	 *
	 * @param {string} tag - The tag of the incompatible-info attribute.
	 * @param {string | number | boolean} [value] - The value of the tag.
	 */
	const incompatible = (tag: string, value?: string | number | boolean) => {
		const attribute = attributeList.get('system-incompatible-info')
		if (!attribute) throw new Error('Cannot find "incompatible info" tag')
		return {
			attribute,
			data: { [tag]: value },
			type: 'unknown' as const,
		}
	}

	let servAttribute: AttributeRecord | undefined
	let areaAttribute: ServiceAreaRecord

	/* Ensure that `value` is a not an array. */
	value = Array.isArray(value) ? JSON.stringify(value) : value
	let data: AttributeData = { value }

	let type: AttributeType = 'attribute'

	/* Parsing the tag and determining what type of attribute it is. */
	switch (true) {
		case tag === 'elig-description' && typeof value === 'string': {
			servAttribute = attributeList.get('other-describe')
			data = {
				text: value as string,
			}
			break
		}
		case ageRegex.test(tag): {
			servAttribute = attributeList.get('elig-age')
			switch (tag) {
				case 'elig-age-or-over': {
					const ageParse = z.coerce.number().safeParse(value)
					const ageData = ageParse.success ? { min: ageParse.data } : tagDataMaps.minAge.get(value)
					if (ageData === undefined) {
						return incompatible(tag)
					}
					data = { data: ageData }
					break
				}
				case 'elig-age-or-under (value = #)':
				case 'elig-age-or-under': {
					const ageParse = z.coerce.number().safeParse(value)
					const ageData = ageParse.success ? { min: ageParse.data } : tagDataMaps.maxAge.get(value)
					if (ageData === undefined) {
						return incompatible(tag)
					}
					data = { data: ageData }
					break
				}
				default: {
					const range = tagDataMaps.range.get(value)
					if (range) {
						data = { data: range }
						break
					}
					const ageSplit = typeof value === 'string' ? value.split('-') : undefined
					const ageParse = z.tuple([z.coerce.number(), z.coerce.number()]).safeParse(ageSplit)
					if (!ageParse.success) {
						return incompatible(tag)
					}
					data = {
						data: {
							min: ageParse.data[0],
							max: ageParse.data[1],
						},
					}
				}
			}

			break
		}
		/* Full tag match */
		case attributeList.get(tag) !== undefined: {
			servAttribute = attributeList.get(tag) as AttributeRecord
			const { requireBoolean: boolean, requireText: text } = servAttribute ?? {
				boolean: undefined,
				text: undefined,
			}
			data = {
				boolean: boolean ? isTruthy(value) : undefined,
				text: text ? value?.toString() : undefined,
				data: !boolean && !text ? value : undefined,
			}
			break
		}
		/* `community-xx-speaker` */
		case !!speakerRegex.exec(tag): {
			servAttribute = attributeList.get('community-language-speakers')
			if (!servAttribute) throw new Error('Unable to locate attribute record for "language-speakers"')
			const [, lang] = speakerRegex.exec(tag) ?? [undefined, '']
			const langRecord = langMap.get(lang)
			if (!langRecord) {
				return incompatible(tag)
			}
			data = { language: langRecord }
			break
		}
		/* `lang-xx` */
		case !!langRegex.exec(tag): {
			servAttribute = attributeList.get('languages-lang-offered')
			if (!servAttribute) throw new Error('Unable to locate attribute record for "lang-offered"')
			const [, lang] = langRegex.exec(tag) ?? [undefined, '']
			const langRecord = langMap.get(lang)
			if (!langRecord) {
				return incompatible(tag)
			}
			data = { language: langRecord }
			break
		}
		/* `service-{county|national|state}-xx...` */
		case !!areaRegex.exec(tag): {
			const area = getAreaRecord(tag, helpers)
			if (typeof area?.id !== 'string') return incompatible(tag)
			areaAttribute = area as NonNullable<ServiceAreaRecord>
			type = 'area' as const
			break
		}
	}

	/* Checking if the areaAttribute and servAttribute are undefined. If they are, it returns the
incompatible-tag data . */
	if (areaAttribute === undefined && servAttribute === undefined) {
		return incompatible(tag, value)
	}

	if (type === 'attribute') {
		return {
			type: 'attribute',
			data,
			attribute: servAttribute as AttributeRecord,
		}
	} else {
		if (!areaAttribute) throw new Error('areaAttribute is undefined!')
		return {
			type: 'area',
			data,
			attribute: areaAttribute,
		}
	}
}
type AttributeRecord = {
	id: string
	tag: string
	category: string
	requireBoolean: boolean
	requireGeo: boolean
	requireData: boolean
	requireLanguage: boolean
	requireText: boolean
}

type ServiceAreaRecord = ReturnType<typeof getAreaRecord>
type AttributeData = {
	boolean?: boolean
	text?: string
	language?: string
	data?: InputJsonValueType
} & Record<string, string | boolean | number | undefined | Record<string, string | number | boolean>>
type AttributeReturnService = {
	attribute: NonNullable<AttributeRecord>
	data: AttributeData | undefined
	type: Exclude<AttributeType, 'area'>
}

type AttributeReturnArea = {
	attribute: NonNullable<ServiceAreaRecord>
	data: AttributeData
	type: Extract<AttributeType, 'area'>
}
type TagCheck = (params: TagCheckParams) => AttributeReturnService | AttributeReturnArea
type AttributeType = 'attribute' | 'area' | 'unknown'
