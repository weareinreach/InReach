import { z } from 'zod'

const numMinMax = z.object({
	/** Number range */
	type: z.literal('numMinMax'),
	/** Minumum of range */
	min: z.number(),
	/** Maximum of range */
	max: z.number(),
})

const numMin = z.object({
	type: z.literal('numMin'),
	min: z.number(),
})
const numMax = z.object({
	type: z.literal('numMax'),
	max: z.number(),
})
const numMinMaxOpt = z.object({
	type: z.literal('numMinMaxOpt'),
	min: z.number().optional(),
	max: z.number().optional(),
}) //.refine(({min,max}) => Boolean(min || max),{message: 'Requires at least `min` or `max`.'})

const number = z.object({
	/** Single number */
	type: z.literal('number'),
	num: z.number(),
})

const incompatible = z
	.object({
		/** Incompatible data from migration - needs to be cleaned up. */
		type: z.literal('incompatible'),
	})
	.catchall(z.record(z.any()))

const commonAccessInstructions = {
	access_value: z.string().nullish(),
	instructions: z.string().optional(),
}

export const accessInstructions = {
	email: z.object({
		access_type: z.literal('email'),
		...commonAccessInstructions,
	}),
	file: z.object({
		access_type: z.literal('file'),
		...commonAccessInstructions,
	}),
	link: z.object({
		access_type: z.literal('link'),
		...commonAccessInstructions,
	}),
	location: z.object({
		access_type: z.literal('location'),
		...commonAccessInstructions,
	}),
	other: z.object({
		access_type: z.literal('other'),
		...commonAccessInstructions,
	}),
	phone: z.object({
		access_type: z.literal('phone'),
		...commonAccessInstructions,
	}),
	sms: z.object({
		access_type: z.literal('sms'),
		sms_body: z.string().optional(),
		...commonAccessInstructions,
	}),
	whatsapp: z.object({
		access_type: z.literal('whatsapp'),
		...commonAccessInstructions,
	}),
	blank: z.object({
		access_type: z.literal(''),
		...commonAccessInstructions,
	}),
	publicTransport: z.object({
		access_type: z.literal('publicTransit'),
		...commonAccessInstructions,
	}),
	getAll: function () {
		return z.discriminatedUnion('access_type', [
			this.email,
			this.file,
			this.link,
			this.location,
			this.other,
			this.phone,
			this.sms,
			this.whatsapp,
			this.blank,
			this.publicTransport,
		])
	},
}
export type AccessInstructions = {
	email: z.infer<typeof accessInstructions.email>
	file: z.infer<typeof accessInstructions.file>
	link: z.infer<typeof accessInstructions.link>
	location: z.infer<typeof accessInstructions.location>
	other: z.infer<typeof accessInstructions.other>
	phone: z.infer<typeof accessInstructions.phone>
	sms: z.infer<typeof accessInstructions.sms>
	whatsapp: z.infer<typeof accessInstructions.whatsapp>
	blank: z.infer<typeof accessInstructions.blank>
	publicTransport: z.infer<typeof accessInstructions.publicTransport>
	getAll: () => z.infer<ReturnType<typeof accessInstructions.getAll>>
}

/**
 * Supplemental information for attribute
 *
 * @param type - `num-min-max`, `num-min`, `num-max`, `number`, or `incompatible`
 */
export const AttributeSupplementDataSchemas = z.union([
	z.discriminatedUnion('type', [numMinMaxOpt, numMinMax, numMin, numMax, number, incompatible]),
	accessInstructions.getAll(),
])
export type AttributeSupplementData = z.infer<typeof AttributeSupplementDataSchemas>

export const AttSuppSchemas = {
	numMinMax: numMinMax,
	numMin: numMin,
	numMax: numMax,
	numMinMaxOpt: numMinMaxOpt.refine(({ min, max }) => Boolean(min || max), {
		message: 'Requires at least `min` or `max`.',
	}),
	number: number,
	incompatible: incompatible,
	accessInstructions: accessInstructions,
}

export type AttributeSupplementSchemas = keyof typeof AttSuppSchemas
/** Dynamic Fields for Supplement Data Schemas */

export enum FieldType {
	text = 'text',
	select = 'select',
	number = 'number',
	currency = 'currency',
}
export interface BaseFieldAttributes {
	key: string
	label: string
	name: string
	type: FieldType
	required?: boolean
}

export interface TextFieldAttributes extends BaseFieldAttributes {
	type: FieldType.text
}
export interface SelectFieldAttributes extends BaseFieldAttributes {
	type: FieldType.select
	options: { value: string; label: string }[]
}
export interface NumberFieldAttributes extends BaseFieldAttributes {
	type: FieldType.number
}
export interface CurrencyFieldAttributes extends BaseFieldAttributes {
	type: FieldType.currency
}
export type FieldAttributes =
	| TextFieldAttributes
	| SelectFieldAttributes
	| NumberFieldAttributes
	| CurrencyFieldAttributes
