import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetAlertsSchema = z.object({
	id: prefixedId('orgLocation'),
})
export type TGetAlertsSchema = z.infer<typeof ZGetAlertsSchema>
