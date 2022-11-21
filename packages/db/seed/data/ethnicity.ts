import { Prisma, Translation, UserEthnicity } from '@prisma/client'

import { prisma } from '~/index'

import { logFile } from '../logger'
import { ListrTask } from '../starter'
import { PrimaryLanguages } from './languages'
import { keySlug } from './translations'
import { connectUser, translationNamespace } from './user'

type Translations = { en: string; es: string }
type EthnicityData = Record<string, Translations>

const ethnicityData: EthnicityData = {
	black: {
		en: 'Black',
		es: 'Negrx',
	},
	'middle eastern/north african': {
		en: 'Middle Eastern/North African',
		es: 'del Medio Oriente/África del Norte',
	},
	asian: { en: 'Asian', es: 'Asiáticx' },
	latinx: { en: 'Latino/a/x/Hispanic', es: 'Latinx/Hispanx' },
	'south asian': { en: 'South Asian', es: 'Sudasiáticx' },
	'biracial/multiracial': { en: 'Biracial/Multiracial', es: 'Birracial/Multirracial' },
	'native/indigenous': {
		en: 'American Indian/Native American/Indigenous Person',
		es: 'Indix Americanx/Nativx Americanx/Indígenx',
	},
	'hawaiian/pacific islander': {
		en: 'Native Hawaiian/Pacific Islander',
		es: 'Nativx de Hawai/Isleñx del Pacífico',
	},
	white: { en: 'White', es: 'Blancx' },
}

export const generateEthnicityRecords = (task: ListrTask) => {
	const queue: Prisma.Prisma__UserEthnicityClient<UserEthnicity>[] = []
	let i = 1
	for (const item in ethnicityData) {
		const transaction: Prisma.Prisma__UserEthnicityClient<UserEthnicity> = prisma.userEthnicity.upsert({
			where: {
				ethnicity: item,
			},
			create: {
				ethnicity: item,
				translationKey: {
					create: {
						key: keySlug(item),
						namespace: {
							connect: {
								name: translationNamespace,
							},
						},
						createdBy: connectUser,
						updatedBy: connectUser,
					},
				},
				createdBy: connectUser,
				updatedBy: connectUser,
			},
			update: {
				updatedBy: connectUser,
				translationKey: {
					update: {
						key: keySlug(item),
						updatedBy: connectUser,
					},
				},
			},
			// include: {
			// 	translationKey: {
			// 		select: {
			// 			id: true
			// 		},
			// 		include: {
			// 			namespace: {
			// 				select: {
			// 					id: true
			// 				}
			// 			}
			// 		}
			// 	}
			// }
		})

		queue.push(transaction)
		const logMessage = `(${i}/${ethnicityData.length}) Added Ethnicity transaction to queue: ${item}`
		logFile.log(logMessage)
		task.output = logMessage
		i++
	}
	return queue
}

export const generateTranslations = (
	ethnicities: UserEthnicity[],
	languageList: PrimaryLanguages,
	task: ListrTask
) => {
	const transactionQueue: Prisma.Prisma__TranslationClient<Translation>[] = []
	for (const lang of languageList) {
		let i = 1
		for (const ethnicity of ethnicities) {
			const text = ethnicityData[ethnicity.ethnicity][lang.localeCode]

			if (typeof text !== 'string') continue

			const transaction = prisma.translation.upsert({
				where: {
					langId_keyId: {
						keyId: ethnicity.translationKeyId,
						langId: lang.id,
					},
				},
				create: {
					text,
					key: {
						connect: {
							id: ethnicity.translationKeyId,
						},
					},
					language: {
						connect: {
							id: lang.id,
						},
					},
					createdBy: connectUser,
					updatedBy: connectUser,
				},
				update: { text, updatedBy: connectUser },
			})
			const logMessage = `(${i}/${ethnicities.length}) Added Translation transaction to queue: ${ethnicity.ethnicity} (${lang.localeCode})`
			logFile.log(logMessage)
			task.output = logMessage

			transactionQueue.push(transaction)
			i++
		}
	}

	return transactionQueue
}
