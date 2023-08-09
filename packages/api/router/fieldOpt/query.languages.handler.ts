import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TLanguagesSchema } from './query.languages.schema'

export const languages = async ({ input }: TRPCHandlerParams<TLanguagesSchema>) => {
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
}
