import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetCountryTranslationSchema } from './query.getCountryTranslation.schema'

export const getCountryTranslation = async ({ input }: TRPCHandlerParams<TGetCountryTranslationSchema>) => {
	try {
		const result = await prisma.country.findUniqueOrThrow({
			where: { cca2: input.cca2 },
			select: { name: true, tsKey: true, tsNs: true },
		})
		return result
	} catch (error) {
		handleError(error)
	}
}
