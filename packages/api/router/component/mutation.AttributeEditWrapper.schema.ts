import { z } from 'zod'

import { JsonInputOrNull } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'

const baseSchema = z.object({ id: prefixedId('attributeSupplement') })

export const ZAttributeEditWrapperSchema = z.discriminatedUnion('action', [
	baseSchema.extend({ action: z.literal('toggleActive') }),
	baseSchema.extend({ action: z.literal('delete') }),
	baseSchema.extend({
		action: z.literal('update'),
		boolean: z.coerce.boolean().optional(),
		data: JsonInputOrNull.optional(),
		text: z.string().optional(),
		countryId: z.string().optional(),
		govDistId: z.string().optional(),
		languageId: z.string().optional(),
	}),
])
export type TAttributeEditWrapperSchema = z.infer<typeof ZAttributeEditWrapperSchema>
