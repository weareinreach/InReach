import { z } from 'zod'

import { JsonInputOrNull } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZAttachAttributeSchema = z.object({
	id: prefixedId('attributeSupplement'),
	attributeId: prefixedId('attribute'),
	organizationId: prefixedId('organization').optional(),
	serviceId: prefixedId('orgService').optional(),
	locationId: prefixedId('orgLocation').optional(),
	countryId: z.string().optional(),
	govDistId: z.string().optional(),
	languageId: z.string().optional(),
	text: z.string().optional(),
	boolean: z.coerce.boolean().optional(),
	data: JsonInputOrNull.optional(),
})

export type TAttachAttributeSchema = z.infer<typeof ZAttachAttributeSchema>
