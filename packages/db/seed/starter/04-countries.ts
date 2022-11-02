import { prisma } from '~/client'
import { CompleteCountry, CompleteCountryTranslation } from '~/zod-schemas'

import { type Countries, countryData } from '../data/countries'
import { createdBy, updatedBy } from '../data/user'

export const seedCountries = async () => {
	const { countries, languageList, userId } = await countryData()

	const prismaTransaction = async (
		country: Countries,
		languages: typeof languageList
	): Promise<SeedCountriesReturn> => {
		const prismaCountry = await prisma.country.upsert({
			where: {
				cca3: country.cca3,
			},
			create: {
				cca3: country.cca3,
				name: country.name.official,
				dialCode: `${country.idd.root}${country.idd.suffixes?.join('')}`,
				flag: country.flag,
				createdBy,
				updatedBy,
			},
			update: {
				name: country.name.official,
				dialCode: `${country.idd.root}${country.idd.suffixes?.join('')}`,
				flag: country.flag,
				updatedBy,
			},
		})

		const bulkUpsert = languages.map((language) =>
			prisma.countryTranslation.upsert({
				where: {
					countryId_langId: {
						countryId: prismaCountry.id,
						langId: language.id,
					},
				},
				create: {
					langId: language.id,
					countryId: prismaCountry.id,
					name: country.translations[language.iso6392 as string].official as string,
					createdById: userId,
					updatedById: userId,
				},
				update: {
					name: country.translations[language.iso6392 as string].official as string,
					updatedById: userId,
				},
			})
		)
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
		console.info(
			`(${i}/${countries.length}) Upserted Country: '${result.name}' with ${result.countryTranslation.length} translated names.`
		)
		i++
	}
}

interface SeedCountriesReturn extends Partial<Omit<CompleteCountry, 'countryTranslation'>> {
	countryTranslation: Partial<CompleteCountryTranslation>[]
}
