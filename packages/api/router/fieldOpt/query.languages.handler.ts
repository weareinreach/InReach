import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TLanguagesSchema } from './query.languages.schema'

export const languages = async ({ ctx, input }: TRPCHandlerParams<TLanguagesSchema>) => {
	try {
		const results = await prisma.language.findMany({
			where: input,
			select: {
				id: true,
				languageName: true,
				localeCode: true,
				iso6392: true,
				nativeName: true,
				activelyTranslated: true,
			},
			orderBy: { languageName: 'asc' },
		})
		return results
	} catch (error) {
		handleError(error)
	}
}
