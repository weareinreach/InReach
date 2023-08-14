import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetSchema = z.union([
	z.object({
		id: prefixedId('orgEmail'),
		orgLocationId: z.undefined().optional(),
		serviceId: z.undefined().optional(),
		organizationId: z.undefined().optional(),
	}),
	z.object({
		orgLocationId: prefixedId('orgLocation'),
		serviceId: z.undefined().optional(),
		organizationId: z.undefined().optional(),
		id: z.undefined().optional(),
	}),
	z.object({
		serviceId: prefixedId('orgService'),
		organizationId: z.undefined().optional(),
		id: z.undefined().optional(),
		orgLocationId: z.undefined().optional(),
	}),
	z.object({
		organizationId: prefixedId('organization'),
		id: z.undefined().optional(),
		orgLocationId: z.undefined().optional(),
		serviceId: z.undefined().optional(),
	}),
])
export type TGetSchema = z.infer<typeof ZGetSchema>
