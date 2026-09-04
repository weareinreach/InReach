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

// A service always needs a name - unlike description, this one can't be left blank. Kept as its own
// object (rather than tightening the shared FreetextObject) since description should stay optional.
const RequiredFreetextObject = z.object({
	text: z.string().trim().min(1, 'Name is required'),
	key: z.string().nullish(),
	ns: z.string().nullish(),
	crowdinId: z.number().nullish(),
})

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])
type Literal = z.infer<typeof literalSchema>
type Json = Literal | { [key: string]: Json } | Json[]
const JsonSchema: z.ZodType<Json> = z.lazy(() =>
	z.union([literalSchema, z.array(JsonSchema), z.record(z.string(), JsonSchema)])
)

export const FormSchema = z.object({
	name: RequiredFreetextObject,
	description: FreetextObject,
	services: prefixedId('serviceTag').array(),
	published: z.boolean().optional().default(true),
	deleted: z.boolean().optional().default(false),
	organizationId: prefixedId('organization'),
})
export type TFormSchema = z.infer<typeof FormSchema>
