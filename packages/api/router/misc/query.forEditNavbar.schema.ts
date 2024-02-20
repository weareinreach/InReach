import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForEditNavbarSchema = z.union([
	z.object({ slug: z.string(), orgLocationId: z.never().optional() }),
	z.object({ orgLocationId: prefixedId('orgLocation'), slug: z.never().optional() }),
])
export type TForEditNavbarSchema = z.infer<typeof ZForEditNavbarSchema>
