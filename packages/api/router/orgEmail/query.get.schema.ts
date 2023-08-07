import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetSchema = z.union([
	z.object({
		id: prefixedId('orgEmail'),
		orgLocationId: z.never(),
		serviceId: z.never(),
		organizationId: z.never(),
	}),
	z.object({
		orgLocationId: prefixedId('orgLocation'),
		serviceId: z.never(),
		organizationId: z.never(),
		id: z.never(),
	}),
	z.object({
		serviceId: prefixedId('orgService'),
		organizationId: z.never(),
		id: z.never(),
		orgLocationId: z.never(),
	}),
	z.object({
		organizationId: prefixedId('organization'),
		id: z.never(),
		orgLocationId: z.never(),
		serviceId: z.never(),
	}),
])
export type TGetSchema = z.infer<typeof ZGetSchema>
