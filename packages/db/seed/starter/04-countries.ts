import { prisma } from '~/index'

import { ListrTask } from '.'
import { type Countries, countryData } from '../data/countries'
import { namespaces } from '../data/translations'
import { createdBy, updatedBy } from '../data/user'
import { logFile } from '../logger'

const translationNamespace = namespaces.country
const translationKey = (item: string) => `country-${item}`

export const seedCountries = async (task: ListrTask) => {
	try {
		const { countries } = await countryData()

		const prismaTransaction = async (country: Countries) => {
			const dialCode = () => {
				if (typeof country.idd.root !== 'number') return undefined
				if (country.idd.suffixes.length === 1)
					return parseInt(`${country.idd.root}${country.idd.suffixes[0]}`)
				return parseInt(country.idd.root)
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
					updatedBy,
				},
			})
			return prismaCountry
		}

		let i = 1
		for (const country of countries) {
			const result = await prismaTransaction(country)
			const logMessage = `(${i}/${countries.length}) Upserted Country: ${result.name}.`
			logFile.log(logMessage)
			task.output = logMessage

			i++
		}
	} catch (err) {
		throw err
	}
}
