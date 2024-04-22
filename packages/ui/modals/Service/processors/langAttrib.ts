import { type AttributeRecord } from '../types'

export const processLangAttrib = (record: AttributeRecord): LangAttribReturn => {
	const { language, supplementId: id, active } = record
	if (!language) {
		return null
	}
	const { languageName } = language

	return {
		id,
		active,
		childProps: {
			children: languageName,
		},
	}
}

export interface LangAttribOutput {
	id: string
	childProps: {
		children: string
	}
	active: boolean
}
export type LangAttribReturn = LangAttribOutput | null
