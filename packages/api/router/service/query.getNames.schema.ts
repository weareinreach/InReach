import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetNamesSchema = z.union([
	z.object({ organizationId: prefixedId('organization'), orgLocationId: z.never() }),
	z.object({ organizationId: z.never(), orgLocationId: prefixedId('orgLocation') }),
])
export type TGetNamesSchema = z.infer<typeof ZGetNamesSchema>
