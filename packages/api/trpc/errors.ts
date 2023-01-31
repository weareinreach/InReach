import { TRPCError } from '@trpc/server'

export const notFound = () => {
	throw new TRPCError({ code: 'NOT_FOUND' })
}
