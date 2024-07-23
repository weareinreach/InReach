import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetByIdInputSchema = z.object({
	id: z.string(),
})

export type TGetByIdInputSchema = z.infer<typeof ZGetByIdInputSchema>

const tsKeySchema = z.object({
	key: z.string(),
	ns: z.string(),
	text: z.string(),
})

export const organizationSchema = z.object({
	id: z.string(),
	slug: z.string(),
	name: z.string(),
	description: z.object({ tsKey: tsKeySchema }).nullable(),
	// locations: z.array(z.string()),
	// orgLeader: z.array(z.string()),
	// orgFocus: z.array(z.string()),
	// serviceCategories: z.array(z.string()),
	// national: z.array(z.string()),
})

const serviceSchema = z.object({
	id: z.string(),
	serviceName: z.object({ tsKey: tsKeySchema }).nullable(),
	description: z.object({ tsKey: tsKeySchema }).nullable(),
	organization: organizationSchema.nullable(),
})

export const ZGetByIdResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	updatedAt: z.date(),
	_count: z.object({
		organizations: z.number(),
		// services: z.number(),
	}),
	organizations: z.array(z.object({ organization: organizationSchema })),
	// services: z.array(z.object({ service: serviceSchema })),
})

export type TGetByIdResponseSchema = z.infer<typeof ZGetByIdResponseSchema>
export type Organization = z.infer<typeof organizationSchema>
export type Service = z.infer<typeof serviceSchema>
