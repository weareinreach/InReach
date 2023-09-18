import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetSchema = z.union([
	z.object({
		id: prefixedId('orgPhone'),
		organizationId: z.undefined().optional(),
		orgLocationId: z.undefined().optional(),
		serviceId: z.undefined().optional(),
	}),
	z.object({
		id: z.undefined().optional(),
		organizationId: prefixedId('organization'),
		orgLocationId: z.undefined().optional(),
		serviceId: z.undefined().optional(),
	}),
	z.object({
		id: z.undefined().optional(),
		organizationId: z.undefined().optional(),
		orgLocationId: prefixedId('orgLocation'),
		serviceId: z.undefined().optional(),
	}),
	z.object({
		id: z.undefined().optional(),
		organizationId: z.undefined().optional(),
		orgLocationId: z.undefined().optional(),
		serviceId: prefixedId('orgService'),
	}),
])
export type TGetSchema = z.infer<typeof ZGetSchema>
