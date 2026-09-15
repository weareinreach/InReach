import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZAttributeEditWrapperDetailSchema = z.object({
	id: prefixedId('attributeSupplement'),
})
export type TAttributeEditWrapperDetailSchema = z.infer<typeof ZAttributeEditWrapperDetailSchema>
