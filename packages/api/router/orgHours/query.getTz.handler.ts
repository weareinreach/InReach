import { TRPCError } from '@trpc/server'
import { find } from 'geo-tz'

import { isIdFor, type Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetTzSchema } from './query.getTz.schema'

const whereId = (input: TGetTzSchema): Prisma.OrgLocationWhereInput => {
	switch (true) {
		case isIdFor('organization', input): {
			return { organization: { id: input } }
		}
		case isIdFor('orgLocation', input): {
			return { id: input }
		}
		case isIdFor('orgService', input): {
			return { services: { some: { serviceId: input } } }
		}
		default: {
			return {}
		}
	}
}
export const getTz = async ({ input }: TRPCHandlerParams<TGetTzSchema>) => {
	const where = whereId(input)
	const { latitude, longitude } =
		(await prisma.orgLocation.findFirst({ where, select: { latitude: true, longitude: true } })) ?? {}

	if (!latitude || !longitude) throw new TRPCError({ code: 'NOT_FOUND' })
	const result = find(latitude, longitude).at(0)
	if (!result) throw new TRPCError({ code: 'NOT_FOUND' })
	return result
}
