import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetSchema = z.union([
	z.object({
		id: prefixedId('orgPhone'),
		organizationId: z.never(),
		orgLocationId: z.never(),
		serviceId: z.never(),
	}),
	z.object({
		id: z.never(),
		organizationId: prefixedId('organization'),
		orgLocationId: z.never(),
		serviceId: z.never(),
	}),
	z.object({
		id: z.never(),
		organizationId: z.never(),
		orgLocationId: prefixedId('orgLocation'),
		serviceId: z.never(),
	}),
	z.object({
		id: z.never(),
		organizationId: z.never(),
		orgLocationId: z.never(),
		serviceId: prefixedId('orgService'),
	}),
])
export type TGetSchema = z.infer<typeof ZGetSchema>
