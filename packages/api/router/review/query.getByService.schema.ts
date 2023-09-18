import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetByServiceSchema = z.object({
	orgId: prefixedId('organization'),
	serviceId: prefixedId('orgService'),
})
export type TGetByServiceSchema = z.infer<typeof ZGetByServiceSchema>
