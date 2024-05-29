import * as R from 'remeda'

import { getAuditedClient, Prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

const update = async ({ ctx, input }: TRPCHandlerParams<TUpdateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const {
		data: { orgLocationId, organizationId, url, ...data },
		id,
	} = input
	const updateArgs = Prisma.validator<Prisma.OrgWebsiteUpdateArgs>()({
		where: { id },
		data: {
			...data,
			...(orgLocationId && {
				locations: {
					upsert: {
						where: {
							orgLocationId_orgWebsiteId: {
								orgLocationId,
								orgWebsiteId: id,
							},
						},
						create: { orgLocationId },
						update: { orgLocationId },
					},
				},
			}),
			...(organizationId && { organization: { connect: { id: organizationId } } }),
		},
	})

	const result = await prisma.$transaction(async (tx) => {
		if (R.isString(url)) {
			const { locations, ...rest } = updateArgs.data
			const upserted = await tx.orgWebsite.upsert({
				where: updateArgs.where,
				create: {
					id,
					url,
					...(locations && { locations: { create: locations.upsert.create } }),
					...rest,
				},
				update: data,
			})

			return upserted
		} else {
			const updated = await tx.orgWebsite.update(updateArgs)
			return updated
		}
	})
	return result
}
export default update
