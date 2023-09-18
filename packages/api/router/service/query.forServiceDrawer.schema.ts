import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForServiceDrawerSchema = z.object({
	organizationId: prefixedId('organization'),
})
export type TForServiceDrawerSchema = z.infer<typeof ZForServiceDrawerSchema>
