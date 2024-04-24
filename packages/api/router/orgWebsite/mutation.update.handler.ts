import * as R from 'remeda'

import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

const update = async ({ ctx, input }: TRPCHandlerParams<TUpdateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const {
		where,
		data,
		data: { url },
	} = input
	console.log(input)
	if (R.isString(url)) {
		const { locations, ...rest } = data
		const upserted = await prisma.orgWebsite.upsert({
			where,
			create: {
				id: where.id,
				url,
				...(locations && { locations: { create: locations.upsert.create } }),
				...rest,
			},
			update: data,
		})

		return upserted
	} else {
		const updated = await prisma.orgWebsite.update({
			where,
			data,
		})
		return updated
	}
}
export default update
