import { namespace } from '~db/generated/namespaces'
import { type TranslationKeySet, type TranslationMap } from '~db/seed/recon/generated/types'
import { formatMessage } from '~db/seed/recon/lib/logger'
import { type PassedTask } from '~db/seed/recon/lib/types'
import { readSuperJSON, trimSpaces } from '~db/seed/recon/lib/utils'

const translatedStrings: Record<string, Map<string, string>> = {}

export const exportTranslation = (props: ExportTranslationProps): void => {
	const { ns, key, text, task } = props
	if (key && text && ns) {
		if (translatedStrings[ns] === undefined) {
			translatedStrings[ns] = new Map<string, string>([[key, text]])
		} else {
			translatedStrings[ns]?.set(key, text)
		}
		if (task) {
			task.output = formatMessage(`Translation exported: ${key}`, 'tlate', true)
		}
	}
}

type ExportTranslationProps = {
	ns: string | undefined
	key: string | undefined
	text: string | undefined
	task?: PassedTask
}

const translationKeySet = readSuperJSON<TranslationKeySet>('translationKeySet')
const translationMap = readSuperJSON<TranslationMap>('translationMap')
export const keyExists = (key: string) => translationKeySet.has(key)

export const generateFreeTextKey: GenerateFreeTextKey = ({ orgId, itemId, type, text }) => {
	switch (type) {
		case 'name':
		case 'access':
		case 'description': {
			const key = itemId ? `${orgId}.${itemId}.${type}` : `${orgId}.${type}`
			if (keyExists(key)) {
				const currentValue = translationMap.get(key)
				if (currentValue && trimSpaces(currentValue) === trimSpaces(text)) return undefined
				return {
					action: 'update',
					ns: namespace.orgData,
					key,
					text: trimSpaces(text),
				}
			}
			return {
				action: 'create',
				ns: namespace.orgData,
				key,
				text: trimSpaces(text),
			}
		}
		case 'supplement': {
			if (!itemId) {
				throw new Error(`'itemId' is required!`)
			}
			const key = `${orgId}.attribute.${itemId}`
			if (keyExists(key)) {
				const currentValue = translationMap.get(key)
				if (currentValue && trimSpaces(currentValue) === trimSpaces(text)) return undefined
				return {
					action: 'update',
					ns: namespace.orgData,
					key,
					text: trimSpaces(text),
				}
			}
			return {
				action: 'create',
				ns: namespace.orgData,
				key,
				text: trimSpaces(text),
			}
		}
	}
}
type GenerateFreeTextKey = (params: FreeTextKey) =>
	| {
			ns: string
			key: string
			text: string
			action: 'create' | 'update'
	  }
	| undefined

type FreeTextKey = {
	orgId: string
	itemId?: string
	type: 'access' | 'description' | 'name' | 'supplement'
	text: string
}
