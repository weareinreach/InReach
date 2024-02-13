import { z } from 'zod'

import { JsonInputOrNull } from '@weareinreach/api/schemas/common'
import { prefixedId } from '@weareinreach/api/schemas/idPrefix'
import { generateId } from '@weareinreach/db/lib/idGen'

export const formSchema = z.object({
	id: prefixedId('attributeSupplement').default(generateId('attributeSupplement')),
	attributeId: prefixedId('attribute'),
	value: z.string(),
	countryId: z.string().optional(),
	govDistId: z.string().optional(),
	languageId: z.string().optional(),
	text: z.string().optional(),
	boolean: z.coerce.boolean().optional(),
	data: JsonInputOrNull.optional(),
})
export type FormSchema = z.infer<typeof formSchema>
