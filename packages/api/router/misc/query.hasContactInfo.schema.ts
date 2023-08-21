import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZHasContactInfoSchema = z.union([
	prefixedId('organization'),
	prefixedId('orgLocation'),
	prefixedId('orgService'),
])
export type THasContactInfoSchema = z.infer<typeof ZHasContactInfoSchema>
