export interface SupplementEventHandler {
	attributeId: string
	countryId?: string
	govDistId?: string
	languageId?: string
	text?: string
	boolean?: boolean
	data?: object
}

/** Dynamic Fields for Supplement Data Schemas */

export enum FieldType {
	text = 'text',
	select = 'select',
	number = 'number',
	currency = 'currency',
}
interface BaseFieldAttributes {
	key: string
	label: string
	name: string
	type: FieldType
	required?: boolean
}

interface TextFieldAttributes extends BaseFieldAttributes {
	type: FieldType.text
}
interface SelectFieldAttributes extends BaseFieldAttributes {
	type: FieldType.select
	options: { value: string; label: string }[]
}
interface NumberFieldAttributes extends BaseFieldAttributes {
	type: FieldType.number
}
interface CurrencyFieldAttributes extends BaseFieldAttributes {
	type: FieldType.currency
}
export type FieldAttributes =
	| TextFieldAttributes
	| SelectFieldAttributes
	| NumberFieldAttributes
	| CurrencyFieldAttributes
