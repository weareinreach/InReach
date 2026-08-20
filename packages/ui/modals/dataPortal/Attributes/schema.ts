import { z } from 'zod'

import { JsonInputOrNull } from '@weareinreach/api/schemas/common'
import { prefixedId } from '@weareinreach/api/schemas/idPrefix'
import { generateId } from '@weareinreach/db/lib/idGen'

export const formSchema = z.object({
	id: prefixedId('attributeSupplement').default(generateId('attributeSupplement')),
	attributeId: prefixedId('attribute'),
	organizationId: prefixedId('organization').optional(),
	serviceId: prefixedId('orgService').optional(),
	locationId: prefixedId('orgLocation').optional(),
	countryId: z.string().optional(),
	govDistId: z.string().optional(),
	languageId: z.string().optional(),
	text: z.string().optional(),
	// `Radio.Item` values are always strings ('true'/'false') - `z.coerce.boolean()` would coerce the
	// string 'false' to `true` (any non-empty string is truthy), so both representations are accepted
	// explicitly and mapped by equality instead.
	boolean: z
		.enum(['true', 'false'])
		.or(z.boolean())
		.transform((val) => val === true || val === 'true')
		.optional(),
	data: JsonInputOrNull.optional(),
})
export type FormSchema = z.infer<typeof formSchema>
