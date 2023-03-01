import { z } from 'zod'

import { InputJsonValue } from './prismaJson'

const StandardPlural = z.object({
	plural: z.literal('PLURAL'),
	pluralValues: z.object({
		one: z.string(),
		other: z.string(),
	}),
})

const Ordinal = z.object({
	plural: z.literal('ORDINAL'),
	pluralValues: z.object({
		one: z.string(),
		two: z.string(),
		few: z.string(),
		other: z.string(),
	}),
})

export const TranslationPluralSchema = z
	.discriminatedUnion('plural', [StandardPlural, Ordinal])
	.transform((val) => ({
		plural: val.plural,
		pluralValues: InputJsonValue.parse(val.pluralValues),
	}))
