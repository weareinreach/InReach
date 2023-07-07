import { type diff } from 'just-diff'
import flush from 'just-flush'
import getByPath from 'just-safe-get'
import setByPath from 'just-safe-set'
import superjson from 'superjson'
import { z } from 'zod'

import { type Prisma } from '~db/client'

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

const getAreaRecord = (tag: string): { data: AttributeSupplementData } | undefined => {
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
				data: { countryId },
			}
		}
		case 'county':
		case 'state': {
			const result = distList.find((x) => x.slug.match(type === 'county' ? county : state))
			if (!result) return undefined
			return {
				data: { govDistId: result.id },
			}
		}
		default: {
			return undefined
		}
	}
}

/** Generate "incompatible" attribute for unknown/misc tags */
const incompatible = (tag: string, value?: string | number | boolean) => {
	const attribute = attributeMap.get('sys.incompatible-info')
	if (!attribute) throw new Error('Cannot find "incompatible info" tag')
	return {
		attributeId: attribute.id,
		supplementData: { [tag]: value },
		type: 'unknown' as const,
	}
}

export const tagParser = (tag: string, value: string | number | boolean) => {
	const speakerRegex = /community-(.+)-speakers/i
	const langRegex = /lang-(.+)/i
	const areaRegex = /service-(?:county|national|state)-(.+)/i
	const ageRegex = /elig-age.*/i

	let attribId: string | undefined
	let supplementData: AttributeSupplementData | undefined
	let type: 'attribute' | 'serviceArea' | 'unknown' = 'attribute'

	switch (true) {
		// #region Elibility description
		case tag === 'elig-description' && typeof value === 'string': {
			attribId = attributeMap.get('eligibility.other-describe')?.id
			supplementData = { text: value.toString() }
			break
		}
		// #endregion

		// #region Cost
		case tag === 'cost-fees' && typeof value === 'string': {
			attribId = attributeMap.get(tag)?.id
			supplementData = { text: value.toString() }
			break
		}
		// #endregion

		// #region Age restriction
		case ageRegex.test(tag): {
			attribId = attributeMap.get('eligibility.elig-age')?.id
			switch (tag) {
				case 'elig-age-or-over': {
					const parsedAge = z.coerce.number().safeParse(value)
					const ageData = parsedAge.success ? { min: parsedAge.data } : tagDataMaps.maxAge.get(value)
					if (!ageData) {
						return incompatible(tag, value)
					}
					supplementData = { data: ageData }
					break
				}
				case 'elig-age-or-under (value = #)':
				case 'elig-age-or-under': {
					const parsedAge = z.coerce.number().safeParse(value)
					const ageData = parsedAge.success ? { max: parsedAge.data } : tagDataMaps.maxAge.get(value)
					if (!ageData) {
						return incompatible(tag, value)
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
						return incompatible(tag, value)
					}
					supplementData = { data: { min: ageParse.data[0], max: ageParse.data[1] } }
				}
			}
			break
		}
		// #endregion

		// #region Languages offered
		case speakerRegex.test(tag): {
			attribId = attributeMap.get('community.language-speakers')?.id
			const [, lang] = speakerRegex.exec(tag) ?? [undefined, '']
			const langRecord = languageMap.get(lang.toLowerCase())
			if (!langRecord) {
				return incompatible(tag, value)
			}
			supplementData = { languageId: langRecord }
			break
		}
		case langRegex.test(tag): {
			attribId = attributeMap.get('lang.lang-offered')?.id
			const [, lang] = langRegex.exec(tag) ?? [undefined, '']
			const langRecord = languageMap.get(lang.toLowerCase())
			if (!langRecord) {
				if (lang.toLowerCase() === 'farsi') {
					const langRecord = languageMap.get('persian')
					supplementData = { languageId: langRecord }
				} else {
					return incompatible(tag, value)
				}
			} else {
				supplementData = { languageId: langRecord }
			}
			break
		}
		// #endregion

		// #region Service Area
		case areaRegex.test(tag): {
			const area = getAreaRecord(tag)
			if (!area) return incompatible(tag, value)
			type = 'serviceArea'
			supplementData = area.data
			break
		}

		// #endregion

		// #region All others
		case attributeMap.get(tag) !== undefined || attributeMap.get(tag.replace(/-/, '.')) !== undefined: {
			const attribute = attributeMap.get(tag) ?? attributeMap.get(tag.replace(/-/, '.'))
			if (!attribute) return incompatible(tag, value)
			attribId = attribute.id

			supplementData = {
				...(attribute.requireBoolean ? { boolean: isTruthy(value) } : {}),
				...(attribute.requireText ? { text: value?.toString() } : {}),
				...(attribute.requireData ? { data: typeof value === 'object' ? value : { migrated: value } } : {}),
			}

			// supplementData = {
			// 	boolean: attribute.requireBoolean ? isTruthy(value) : undefined,
			// 	text: attribute.requireText ? value?.toString() : undefined,
			// 	data: attribute.requireData ? (typeof value === 'object' ? value : { migrated: value }) : undefined,
			// }
			break
		}
		// #endregion
		default: {
			return incompatible(tag, value)
		}
	}
	return {
		attributeId: attribId,
		...(Object.keys(supplementData).length ? { supplementData } : undefined),
		type,
	}
}

export const generateSupplementTxn = (
	updatedRecord: AttrSupp | AttrSupp[],
	changes: ReturnType<typeof diff>
) => {
	let pendingUpdates: AttrSuppChangesReturn | AttrSuppChangesReturn[]
	const updatesToReturn = Array.isArray(updatedRecord) ? [] : {}
	if (Array.isArray(updatedRecord)) {
		pendingUpdates = updatedRecord.map(({ id, ...data }) => ({
			where: { id },
			data,
		}))
	} else {
		const { id, ...data } = updatedRecord
		pendingUpdates = { where: { id }, data }
	}
	const isPath = (path: unknown): path is Array<string | number> => Array.isArray(path)
	let idx = 0
	const changedItems = changes.flatMap(({ path }) => {
		if (!isPath(path)) throw new Error('path must be an array!')
		const testPath = path.at(0) ?? ''
		if (typeof testPath === 'number' || typeof parseInt(testPath) === 'number') {
			const [firstSegment] = path.splice(0, 1)
			if (!Array.isArray(updatedRecord)) {
				return [
					{ get: ['where'], set: ['where'] },
					{
						get: ['data', ...path.map((x) => x.toString())],
						set: ['data', ...path.map((x) => x.toString())],
					},
				]
			}
			const returnPath = [
				{ get: flush([firstSegment?.toString(), 'where']), set: flush([idx.toString(), 'where']) },
				{
					get: flush([firstSegment?.toString(), 'data', ...path.map((x) => x.toString())]),
					set: flush([idx.toString(), 'data', ...path.map((x) => x.toString())]),
				},
			]
			idx++
			return returnPath
		}
		return [
			{ get: ['where'], set: ['where'] },
			{
				get: ['data', ...path.map((x) => x.toString())],
				set: ['data', ...path.map((x) => x.toString())],
			},
		]
	})
	for (const path of changedItems) {
		const dataToSet = getByPath(pendingUpdates, path.get)
		setByPath(updatesToReturn, path.set, dataToSet)
	}
	return updatesToReturn as AttrSuppChangesReturn | AttrSuppChangesReturn[]
}
export type AttrSupp = {
	id?: string
	data?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput
	boolean?: boolean | null
	countryId?: string | null
	govDistId?: string | null
	languageId?: string | null
	text?: string
	textId?: string | null
}

interface AttributeSupplementData {
	countryId?: string
	govDistId?: string
	languageId?: string
	text?: string
	boolean?: boolean
	data?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput
}

interface AttrSuppChangesReturn {
	where: { id?: string }
	data: AttrSupp
}
