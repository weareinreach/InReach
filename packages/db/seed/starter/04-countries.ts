import { Prisma } from '@prisma/client'

import { prisma } from '~/index'

import { ListrTask } from '.'
import { type Countries, countryData } from '../data/countries'
import { namespaces } from '../data/translations'
import { createdBy, updatedBy } from '../data/user'
import { logFile } from '../logger'

const translationNamespace = namespaces.common
const translationKey = (item: string) => `country-${item}`

export const seedCountries = async (task: ListrTask) => {
	try {
		const { countries, languageList, userId } = await countryData()

		const prismaTransaction = async (country: Countries, languages: typeof languageList) => {
			const dialCode = () => {
				if (typeof country.idd.root !== 'number') return undefined
				if (country.idd.suffixes.length === 1)
					return parseInt(`${country.idd.root}${country.idd.suffixes[0]}`)
				return parseInt(country.idd.root)
			}
			const translations: Prisma.TranslationCreateManyKeyInput[] = []
			for (const lang of languages) {
				if (lang.iso6392 === 'eng') {
					const text = country.name.common
					translations.push({
						langId: lang.id,
						text,
						createdById: userId,
						updatedById: userId,
					})
				} else if (lang.iso6392 && typeof country.translations[lang.iso6392].common === 'string') {
					const text = country.translations[lang.iso6392].common
					translations.push({
						langId: lang.id,
						text,
						createdById: userId,
						updatedById: userId,
					})
				}
			}
			/* Upserting the country. */
			const prismaCountry = await prisma.country.upsert({
				where: {
					cca3: country.cca3,
				},
				create: {
					cca2: country.cca2,
					cca3: country.cca3,
					name: country.name.common,
					dialCode: dialCode(),
					flag: country.flag,
					translationKey: {
						create: {
							namespace: {
								connectOrCreate: {
									where: {
										name: translationNamespace,
									},
									create: {
										name: translationNamespace,
										createdBy,
										updatedBy,
									},
								},
							},
							key: translationKey(country.cca3),
							translations: {
								createMany: {
									data: translations,
								},
							},
							createdBy,
							updatedBy,
						},
					},
					createdBy,
					updatedBy,
				},
				update: {
					cca2: country.cca2,
					name: country.name.common,
					dialCode: dialCode(),
					flag: country.flag,
					translationKey: {
						update: {
							translations: {
								createMany: {
									data: translations,
									skipDuplicates: true,
								},
							},
						},
					},
					updatedBy,
				},
				include: {
					translationKey: {
						include: {
							translations: {
								select: {
									text: true,
								},
							},
						},
					},
				},
			})
			return prismaCountry
		}

		let i = 1
		for (const country of countries) {
			const result = await prismaTransaction(country, languageList)
			const logMessage = `(${i}/${countries.length}) Upserted Country: '${result.name}' with ${result.translationKey.translations.length} translated names.`
			logFile.log(logMessage)
			task.output = logMessage

			i++
		}
	} catch (err) {
		throw err
	}
}
