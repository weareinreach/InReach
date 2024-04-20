import { type TOptions } from 'i18next'
import { useTranslation } from 'next-i18next'

import { type DB } from '@weareinreach/api/prisma/types'

const isNestedFreeText = (item: unknown): item is NestedFreeText => {
	if (!item || typeof item !== 'object') {
		return false
	}
	if ('tsKey' in item) {
		return true
	}
	return false
}

export const getFreeText: GetFreeText = (freeTextRecord, tOptions) => {
	const { key: dbKey, tsKey } = isNestedFreeText(freeTextRecord)
		? freeTextRecord
		: { key: freeTextRecord.key, tsKey: { text: freeTextRecord.text } }
	const deconstructedKey = dbKey.split('.')
	const ns = deconstructedKey[0]
	if (!deconstructedKey.length || !ns) {
		throw new Error('Invalid key')
	}
	const key = deconstructedKey.join('.')
	const options = { ns, defaultValue: tsKey.text, ...tOptions } satisfies TOptions
	return { key, options }
}
export const useFreeText: UseFreeText = (freeTextRecord, tOptions) => {
	const { key, options } = getFreeText(freeTextRecord, tOptions)
	if (!tOptions?.ns) {
		throw new Error('Need namespace')
	}
	const { t } = useTranslation(tOptions.ns)

	return t(key, options)
}

export interface NestedFreeText extends Pick<DB.FreeText, 'key'>, Partial<Omit<DB.FreeText, 'key'>> {
	tsKey: Pick<DB.TranslationKey, 'text'> & Partial<Omit<DB.TranslationKey, 'text'>>
}
export type TranslationKeyRecord = Pick<DB.TranslationKey, 'key' | 'ns' | 'text'>

export type GetFreeText = (
	freeTextRecord: NestedFreeText | TranslationKeyRecord,
	tOptions?: TOptions
) => { key: string; options: TOptions }

export type UseFreeText = (freeTextRecord: NestedFreeText, tOptions?: TOptions) => string
