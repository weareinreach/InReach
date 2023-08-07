import { TRPCError } from '@trpc/server'
import { find } from 'geo-tz'

import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetTzSchema } from './query.getTz.schema'

export const getTz = async ({ input }: TRPCHandlerParams<TGetTzSchema>) => {
	try {
		const { lat, lon } = input
		const result = find(lat, lon).at(0)
		if (!result) throw new TRPCError({ code: 'NOT_FOUND' })
		return result
	} catch (error) {
		handleError(error)
	}
}
