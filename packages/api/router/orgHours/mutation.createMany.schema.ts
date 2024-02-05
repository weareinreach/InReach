import { type z } from 'zod'

import { generateId, type Prisma } from '@weareinreach/db'

import { ZCreateSchema } from './mutation.create.schema'

export const ZCreateManySchema = ZCreateSchema.array().transform((parsedData) => {
	const orgHours: Prisma.OrgHoursCreateManyInput[] = []
	for (const item of parsedData) {
		const id = generateId('orgHours')
		orgHours.push({ id, ...item })
	}
	return orgHours
})
export type TCreateManySchema = z.infer<typeof ZCreateManySchema>
