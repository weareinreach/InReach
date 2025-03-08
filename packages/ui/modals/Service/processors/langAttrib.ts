import { type AttributeRecord } from '../types'

export const processLangAttrib = (
	record: AttributeRecord,
	t: (key: string, options?: { ns?: string; lng?: string }) => string,
	locale: string = 'en'
): LangAttribReturn => {
	const { language, supplementId: id, active, tsKey } = record
	if (language) {
		return {
			id,
			active,
			childProps: {
				children: language.languageName,
			},
		}
	}
	if (tsKey) {
		return {
			id,
			active,
			childProps: {
				children: t(tsKey, { ns: 'attribute', lng: locale }),
			},
		}
	}
	return null
}

export interface LangAttribOutput {
	id: string
	childProps: {
		children: string
	}
	active: boolean
}
export type LangAttribReturn = LangAttribOutput | null
