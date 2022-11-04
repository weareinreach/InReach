import { type Prisma } from '@prisma/client'

import { getPrimaryLanguages } from './languages'
import { connectUser } from './user'

type LanguageList = Prisma.PromiseReturnType<typeof getPrimaryLanguages>

const ethnicityData = {
	en: [
		'Black',
		'Middle Eastern/North African',
		'Asian',
		'Latino/a/x/Hispanic',
		'South Asian',
		'Biracial/Multiracial',
		'American Indian/Native American/Indigenous Person',
		'Native Hawaiian/Pacific Islander',
		'White',
	],

	es: [
		'Negrx',
		'del Medio Oriente/África del Norte',
		'Asiáticx',
		'Latinx/Hispanx',
		'Sudasiáticx',
		'Birracial/Multirracial',
		'Indix Americanx/Nativx Americanx/Indígenx',
		'Nativx de Hawai/Isleñx del Pacífico',
		'Blancx',
	],
}
const generator = async (lang: LanguageList[0]) => {
	if (!Object.keys(ethnicityData).includes(lang.localeCode)) throw 'No data for locale code'
	const ethnicities = ethnicityData[lang.localeCode] as string[]
	const enQueue = ethnicities.map(
		(ethnicity: string): Prisma.UserEthnicityUpsertArgs => ({
			where: {
				langId_ethnicity: {
					langId: lang.id,
					ethnicity,
				},
			},
			create: {
				ethnicity,
				language: {
					connect: {
						localeCode: lang.localeCode,
					},
				},
				createdBy: connectUser,
				updatedBy: connectUser,
			},
			update: {
				ethnicity,
				updatedBy: connectUser,
			},
		})
	)

	return enQueue
}

export const generateEthnicities = async () => {
	const languageList = await getPrimaryLanguages()

	const transactions = await Promise.all(languageList.map(async (item) => await generator(item)))
	return transactions.flat(2)
}
