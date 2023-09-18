import { prisma } from '@weareinreach/db'
import { isPublic } from '~api/schemas/selects/common'
import { organizationInclude } from '~api/schemas/selects/org'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetByIdSchema } from './query.getById.schema'

export const getById = async ({ ctx, input }: TRPCHandlerParams<TGetByIdSchema>) => {
	const { select } = organizationInclude(ctx)
	const org = await prisma.organization.findUniqueOrThrow({
		where: {
			id: input.id,
			...isPublic,
		},
		select,
	})
	const { allowedEditors, ...orgData } = org
	const reformatted = {
		...orgData,
		isClaimed: Boolean(allowedEditors.length),
		services: org.services.map((serv) => ({ service: serv })),
	}

	return reformatted
}
