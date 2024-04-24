import { prisma } from '@weareinreach/db'
import { isPublic } from '~api/schemas/selects/common'
import { organizationInclude } from '~api/schemas/selects/org'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetBySlugSchema } from './query.getBySlug.schema'

const getBySlug = async ({ ctx, input }: TRPCHandlerParams<TGetBySlugSchema>) => {
	const { slug } = input
	const { select } = organizationInclude(ctx)
	const org = await prisma.organization.findUniqueOrThrow({
		where: {
			slug,
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
export default getBySlug
