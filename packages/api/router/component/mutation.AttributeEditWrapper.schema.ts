import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZAttributeEditWrapperSchema = z.object({
	id: prefixedId('attributeSupplement'),
	action: z.enum(['toggleActive', 'delete']),
})
export type TAttributeEditWrapperSchema = z.infer<typeof ZAttributeEditWrapperSchema>
