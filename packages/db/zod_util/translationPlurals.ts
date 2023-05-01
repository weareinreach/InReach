import { z } from 'zod'

import { InputJsonValue } from './prismaJson'

const StandardPlural = z.object({
	interpolation: z.literal('PLURAL'),
	interpolationValues: z.object({
		one: z.string(),
		other: z.string(),
	}),
})

const Ordinal = z.object({
	interpolation: z.literal('ORDINAL'),
	interpolationValues: z.object({
		one: z.string(),
		two: z.string(),
		few: z.string(),
		other: z.string(),
	}),
})

export const TranslationPluralSchema = z
	.discriminatedUnion('interpolation', [StandardPlural, Ordinal])
	.transform(({ interpolation, interpolationValues }) => ({
		interpolation,
		interpolationValues: InputJsonValue.parse(interpolationValues),
	}))
