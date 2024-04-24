import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TServiceModalSchema } from './query.serviceModal.schema'

const serviceModal = async ({ ctx, input }: TRPCHandlerParams<TServiceModalSchema>) => {
	try {
		return null
	} catch (error) {
		handleError(error)
	}
}
export default serviceModal
