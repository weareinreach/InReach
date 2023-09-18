import { DateTime } from 'luxon'
import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZUpdateSchema = z
	.object({
		id: prefixedId('orgHours'),
		data: z
			.object({
				/** Sun 0, Mon 1, Tue 2, Wed 3, Thu 3, Fri 4, Sat 6 */
				dayIndex: z.number().gte(0).lte(6),
				start: z.coerce.date(),
				end: z.coerce.date(),
				tz: z.string().refine((val) => DateTime.now().setZone(val).isValid),
				orgLocId: prefixedId('orgLocation'),
				orgServiceId: prefixedId('orgService'),
				organizationId: prefixedId('organization'),
				closed: z.boolean(),
			})
			.partial(),
	})
	.transform(({ data, id }) => Prisma.validator<Prisma.OrgHoursUpdateArgs>()({ where: { id }, data }))
export type TUpdateSchema = z.infer<typeof ZUpdateSchema>
