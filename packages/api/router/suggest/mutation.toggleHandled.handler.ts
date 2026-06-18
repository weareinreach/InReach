import { TRPCError } from '@trpc/server'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TToggleHandledSchema } from './mutation.toggleHandled.schema'

const toggleHandled = async ({ input }: TRPCHandlerParams<TToggleHandledSchema>) => {
	const { id, handled } = input

	try {
		const updatedSuggestion = await prisma.suggestion.update({
			where: { id },
			data: { handled },
			select: {
				id: true,
				handled: true,
			},
		})

		return { success: true, data: updatedSuggestion }
	} catch (error) {
		// Gracefully handle internal prisma lookup or connection failures
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: 'Failed to update the tracking state of this suggestion.',
			cause: error,
		})
	}
}

export default toggleHandled
