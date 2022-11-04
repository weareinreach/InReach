import { CountryTranslation, Prisma } from '@prisma/client'
import type { ListrRenderer, ListrTaskWrapper } from 'listr2'

import { prisma } from '~/client'
import { CompleteCountry, CompleteCountryTranslation } from '~/zod-schemas'

import { type Countries, countryData } from '../data/countries'
import { createdBy, updatedBy } from '../data/user'
import { logFile } from '../logger'

type BulkUpsertQueue = Prisma.Prisma__CountryTranslationClient<CountryTranslation>[]

export const seedCountries = async (task: ListrTaskWrapper<unknown, typeof ListrRenderer>) => {
	try {
		const { countries, languageList, userId } = await countryData()

		const prismaTransaction = async (
			country: Countries,
			languages: typeof languageList
		): Promise<SeedCountriesReturn> => {
			const dialCode = () => {
				if (country.idd.suffixes.length === 1) return `${country.idd.root}${country.idd.suffixes[0]}`
				return `${country.idd.root}`
			}
			/* Upserting the country. */
			const prismaCountry = await prisma.country.upsert({
				where: {
					cca3: country.cca3,
				},
				create: {
					cca3: country.cca3,
					name: country.name.official,
					dialCode: dialCode(),
					flag: country.flag,
					createdBy,
					updatedBy,
				},
				update: {
					name: country.name.official,
					dialCode: dialCode(),
					flag: country.flag,
					updatedBy,
				},
			})

			/* Creating a queue of upserts to be executed in a transaction. */
			const bulkUpsert: BulkUpsertQueue = []
			for (const language of languages) {
				if (!language.iso6392 || !Object.keys(country.translations).includes(language.iso6392)) {
					if (language.iso6392 !== 'eng') {
						continue
					}
				}

				const countryTranslation = (): string => {
					if (!language.iso6392) throw 'No language code defined'
					if (language.iso6392 === 'eng') return country.name.official
					return country.translations[language.iso6392].official
				}
				const action = prisma.countryTranslation.upsert({
					where: {
						countryId_langId: {
							countryId: prismaCountry.id,
							langId: language.id,
						},
					},
					create: {
						langId: language.id,
						countryId: prismaCountry.id,
						name: countryTranslation(),
						createdById: userId,
						updatedById: userId,
					},
					update: {
						name: countryTranslation(),
						updatedById: userId,
					},
				})

				bulkUpsert.push(action)
			}

			/* Executing the queue of upserts in a transaction. */
			const bulkResults = await prisma.$transaction(bulkUpsert)

			const result = {
				...prismaCountry,
				countryTranslation: bulkResults as Partial<CompleteCountryTranslation>[],
			}
			return result
		}

		let i = 1
		for (const country of countries) {
			const result = await prismaTransaction(country, languageList)
			logFile.info(
				`(${i}/${countries.length}) Upserted Country: '${result.name}' with ${result.countryTranslation.length} translated names.`
			)
			task.output = `(${i}/${countries.length}) Upserted Country: '${result.name}' with ${result.countryTranslation.length} translated names.`

			i++
		}
	} catch (err) {
		throw err
	}
}

interface SeedCountriesReturn extends Partial<Omit<CompleteCountry, 'countryTranslation'>> {
	countryTranslation: Partial<CompleteCountryTranslation>[]
}
