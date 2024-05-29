import { z } from 'zod'

import { prefixedId } from '@weareinreach/api/schemas/idPrefix'

const FreetextObject = z
	.object({
		text: z.string().nullable(),
		key: z.string().nullish(),
		ns: z.string().nullish(),
		crowdinId: z.number().nullish(),
	})
	.nullish()

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])
type Literal = z.infer<typeof literalSchema>
type Json = Literal | { [key: string]: Json } | Json[]
const JsonSchema: z.ZodType<Json> = z.lazy(() =>
	z.union([literalSchema, z.array(JsonSchema), z.record(JsonSchema)])
)

export const FormSchema = z.object({
	name: FreetextObject,
	description: FreetextObject,
	services: prefixedId('serviceTag').array(),
	published: z.boolean().optional().default(true),
	deleted: z.boolean().optional().default(false),
	organizationId: prefixedId('organization'),
})
export type TFormSchema = z.infer<typeof FormSchema>
