import { TRPCError } from '@trpc/server'
import { find } from 'geo-tz'

import { isIdFor, type Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetTzSchema } from './query.getTz.schema'

// Every branch also requires the matched location itself (and, for the org/service branches, the related
// org/service) to be published and not deleted - without this, the timezone helper worked from a hidden
// location exactly as if it were public, which could reveal something about a location whose whole point was
// to not be shown.
const whereId = (input: TGetTzSchema): Prisma.OrgLocationWhereInput => {
	const visible = { published: true, deleted: false }
	switch (true) {
		case isIdFor('organization', input): {
			return { organization: { id: input, ...visible }, ...visible }
		}
		case isIdFor('orgLocation', input): {
			return { id: input, ...visible }
		}
		case isIdFor('orgService', input): {
			return { services: { some: { serviceId: input, service: visible } }, ...visible }
		}
		default: {
			return {}
		}
	}
}
const getTz = async ({ input }: TRPCHandlerParams<TGetTzSchema>) => {
	const where = whereId(input)
	const { latitude, longitude } =
		(await prisma.orgLocation.findFirst({ where, select: { latitude: true, longitude: true } })) ?? {}

	if (!latitude || !longitude) {
		throw new TRPCError({ code: 'NOT_FOUND' })
	}
	const result = find(latitude, longitude).at(0)
	if (!result) {
		throw new TRPCError({ code: 'NOT_FOUND' })
	}
	return result
}
export default getTz
