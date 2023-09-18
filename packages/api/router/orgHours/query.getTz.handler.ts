import { TRPCError } from '@trpc/server'
import { find } from 'geo-tz'

import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetTzSchema } from './query.getTz.schema'

export const getTz = async ({ input }: TRPCHandlerParams<TGetTzSchema>) => {
	const { lat, lon } = input
	const result = find(lat, lon).at(0)
	if (!result) throw new TRPCError({ code: 'NOT_FOUND' })
	return result
}
