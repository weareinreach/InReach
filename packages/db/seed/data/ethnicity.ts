import { type Prisma } from '@prisma/client'
import { prisma } from 'index'

import { connectUser } from './user'

const optsEN = [
	'Black',
	'Middle Eastern/North African',
	'Asian',
	'Latino/a/x/Hispanic',
	'South Asian',
	'Biracial/Multiracial',
	'American Indian/Native American/Indigenous Person',
	'Native Hawaiian/Pacific Islander',
	'White',
]

const optsES = [
	'Negrx',
	'del Medio Oriente/África del Norte',
	'Asiáticx',
	'Latinx/Hispanx',
	'Sudasiáticx',
	'Birracial/Multirracial',
	'Indix Americanx/Nativx Americanx/Indígenx',
	'Nativx de Hawai/Isleñx del Pacífico',
	'Blancx',
]

const en = ['en', 'en_us', 'en_mx', 'en_ca']
const es = ['es', 'es_us', 'es_mx', 'es_ca']

const generator = async (lang: string[], ethnicities: string[]) => {
	const enQueue = Promise.all(
		lang.map(async (item) => {
			const { id: langId } = await prisma.language.findUniqueOrThrow({
				where: {
					localeCode: item,
				},
				select: {
					id: true,
				},
			})

			const records = ethnicities.map(
				(ethnicity): Prisma.UserEthnicityUpsertArgs => ({
					where: {
						langId_ethnicity: {
							langId,
							ethnicity,
						},
					},
					create: {
						ethnicity,
						language: {
							connect: {
								localeCode: item,
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
			return records
		})
	)
	return await enQueue
}

export const generateEthnicities = async () => {
	const queue = [
		{ lang: en, ethnicities: optsEN },
		{ lang: es, ethnicities: optsES },
	]
	const transactions = await Promise.all(
		queue.map(async (item) => await generator(item.lang, item.ethnicities))
	)
	return transactions.flat(3)
}
