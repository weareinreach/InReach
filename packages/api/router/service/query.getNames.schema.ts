import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetNamesSchema = z.union([
	z.object({ organizationId: prefixedId('organization'), orgLocationId: z.undefined().optional() }),
	z.object({ organizationId: z.undefined().optional(), orgLocationId: prefixedId('orgLocation') }),
])
export type TGetNamesSchema = z.infer<typeof ZGetNamesSchema>
