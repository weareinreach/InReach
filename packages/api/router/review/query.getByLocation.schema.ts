import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetByLocationSchema = z.object({
	orgId: prefixedId('organization'),
	locationId: prefixedId('orgLocation'),
})
export type TGetByLocationSchema = z.infer<typeof ZGetByLocationSchema>
