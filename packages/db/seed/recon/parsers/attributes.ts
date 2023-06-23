import superjson from 'superjson'
import { z } from 'zod'

import { tagDataMaps } from './tagDataMaps'
import { type AttributeMap, type CountryMap, type DistList, type LanguageMap } from '../generated/types'
import { readSuperJSON } from '../lib/utils'

//#region Helper - isTruthy

/**
 * It takes a value, converts it to a string, converts that string to lowercase, and then returns true if the
 * string is "yes" or "true", false if it's "no" or "false", and undefined if it's "unknown"
 *
 * @param val - Typeof value
 * @returns A function that takes a value and returns a boolean.
 */
export const isTruthy = (val: string | boolean | number | undefined | unknown[]) => {
	const check = val?.toString().toLocaleLowerCase()
	if (check === 'unknown') return undefined
	if (check === 'yes' || check === 'true') return true
	return false
}

//#endregion

const countryMap = readSuperJSON<CountryMap>('countryMap')
const distList = readSuperJSON<DistList>('distList')
const attributeMap = readSuperJSON<AttributeMap>('attributeMap')
const languageMap = readSuperJSON<LanguageMap>('languageMap')

const areaCountryMap = new Map([
	['canada', 'ca'],
	['united-states', 'us'],
	['mexico', 'mx'],
])

const getAreaRecord = (tag: string): { id: string; type: 'country' | 'dist' } | undefined => {
	const tagBreakdown = tag.split('-')
	tagBreakdown.shift()
	const type = tagBreakdown.shift()
	const search = tagBreakdown.join('-')
	const state = new RegExp(`\\w{2}-${search}`, 'gi')
	const county = new RegExp(`\\w{2}-${search}-.*`, 'gi')
	switch (type) {
		case 'national': {
			const cca2 = areaCountryMap.get(search)
			if (!cca2) return undefined
			const countryId = countryMap.get(cca2)
			if (!countryId) return undefined
			return {
				type: 'country' as const,
				id: countryId,
			}
		}
		case 'county':
		case 'state': {
			const result = distList.find((x) => x.slug.match(type === 'county' ? county : state))
			if (!result) return undefined
			return {
				type: 'dist' as const,
				id: result.id,
			}
		}
		default: {
			return undefined
		}
	}
}

/** Generate "incompatible" attribute for unknown/misc tags */
const incompatible = (tag: string, value?: string | number | boolean) => {
	const attribute = attributeMap.get('system-incompatible-info')
	if (!attribute) throw new Error('Cannot find "incompatible info" tag')
	return {
		attribute,
		data: { [tag]: value },
		type: 'unknown' as const,
	}
}

export const tagParser = (tag: string, value: string | number | boolean) => {
	const speakerRegex = /community-(.+)-speakers/i
	const langRegex = /lang-(.+)/i
	const areaRegex = /service-(?:county|national|state)-(.+)/i
	const ageRegex = /elig-age.*/i

	let attribId: string | undefined
	let supplementData: AttributeSupplementData

	switch (true) {
		case tag === 'elig-description' && typeof value === 'string': {
			attribId = attributeMap.get('eligibility.other-describe')?.id
			supplementData = { text: value.toString() }
			break
		}
		case tag === 'cost-fees' && typeof value === 'string': {
			attribId = attributeMap.get(tag)?.id
			supplementData = { text: value.toString() }
			break
		}
		case ageRegex.test(tag): {
			attribId = attributeMap.get('eligibility.elig-age')?.id
			switch (tag) {
				case 'elig-age-or-over': {
					const parsedAge = z.coerce.number().safeParse(value)
					const ageData = parsedAge.success ? { min: parsedAge.data } : tagDataMaps.maxAge.get(value)
					if (!ageData) {
						return incompatible(tag)
					}
					supplementData = { data: ageData }
					break
				}
				case 'elig-age-or-under (value = #)':
				case 'elig-age-or-under': {
					const parsedAge = z.coerce.number().safeParse(value)
					const ageData = parsedAge.success ? { max: parsedAge.data } : tagDataMaps.maxAge.get(value)
					if (!ageData) {
						return incompatible(tag)
					}
					supplementData = { data: ageData }
					break
				}
				default: {
					const range = tagDataMaps.range.get(value)
					if (range) {
						supplementData = { data: range }
						break
					}
					const ageSplit = typeof value === 'string' ? value.split('-') : undefined
					const ageParse = z.tuple([z.coerce.number(), z.coerce.number()]).safeParse(ageSplit)
					if (!ageParse.success) {
						return incompatible(tag)
					}
					supplementData = { data: { min: ageParse.data[0], max: ageParse.data[1] } }
				}
			}
			break
		}
		case speakerRegex.test(tag): {
			attribId = attributeMap.get('community-language-speakers')?.id
			const [, lang] = speakerRegex.exec(tag) ?? [undefined, '']
			// !!: Check to see if this is passing the full name or just the ISO...
			const langRecord = languageMap.get(lang)
			if (!langRecord) {
				return incompatible(tag)
			}

			break
		}

		case attributeMap.get(tag) !== undefined: {
			const attribute = attributeMap.get(tag)
			if (!attribute) return incompatible(tag)
			attribId = attribute.id

			supplementData = {
				boolean: attribute.requireBoolean ? isTruthy(value) : undefined,
				text: attribute.requireText ? value?.toString() : undefined,
				data:
					!attribute.requireBoolean && !attribute.requireText
						? typeof value === 'object'
							? value
							: { migrated: value }
						: undefined,
			}
			break
		}
	}
}

interface AttributeSupplementData {
	countryId?: string
	govDistId?: string
	languageId?: string
	text?: string
	boolean?: boolean
	data?: unknown
}
