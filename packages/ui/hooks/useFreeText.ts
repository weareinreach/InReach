import { type DB } from '@weareinreach/api/prisma/types'
import { TOptions, DefaultTFuncReturn } from 'i18next'
import { useTranslation } from 'next-i18next'

export const getFreeText: GetFreeText = (freeTextRecord, tOptions) => {
	const { key: dbKey, tsKey } = freeTextRecord
	const deconstructedKey = dbKey.split('.')
	const ns = deconstructedKey[0]
	if (!deconstructedKey.length || !ns) throw new Error('Invalid key')
	const key = deconstructedKey.join('.')
	const options = { ns, defaultValue: tsKey.text, ...tOptions } satisfies TOptions
	return { key, options }
}
export const useFreeText: UseFreeText = (freeTextRecord, tOptions) => {
	const { key, options } = getFreeText(freeTextRecord, tOptions)
	if (!tOptions?.ns) throw new Error('Need namespace')
	const { t } = useTranslation(tOptions.ns)

	return t(key, options)
}

export interface UseFreeTextProps extends Pick<DB.FreeText, 'key'>, Partial<Omit<DB.FreeText, 'key'>> {
	tsKey: Pick<DB.TranslationKey, 'text'> & Partial<Omit<DB.TranslationKey, 'text'>>
}

export type GetFreeText = (
	freeTextRecord: UseFreeTextProps,
	tOptions?: TOptions
) => { key: string; options: TOptions }

export type UseFreeText = (freeTextRecord: UseFreeTextProps, tOptions?: TOptions) => DefaultTFuncReturn
