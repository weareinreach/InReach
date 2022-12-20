import { countries as countryExtra } from 'countries-languages'

import { prisma } from '~/index'

import { namespaces } from '../data/00-namespaces'
import { type Countries, countryData } from '../data/04-countries'
import { logFile } from '../logger'
import { ListrTask } from '../starterData'

const translationNamespace = namespaces.country

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
			const demonymData: string | undefined = countryExtra[country.cca2]?.demonym
			const demonym = demonymData
				? {
						create: {
							key: `${country.cca3}.demonym_one`,
							text: demonymData,
							namespace: { connect: { name: translationNamespace } },
							children: {
								create: {
									key: `${country.cca3}.demonym_other`,
									text: `${demonymData}s`,
									namespace: { connect: { name: translationNamespace } },
								},
							},
						},
				  }
				: undefined

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
					demonym,
					key: {
						create: {
							namespace: {
								connectOrCreate: {
									where: {
										name: translationNamespace,
									},
									create: {
										name: translationNamespace,
									},
								},
							},
							key: `${country.cca3}.name`,
							text: country.name.common,
						},
					},
				},
				update: {
					cca2: country.cca2,
					name: country.name.common,
					dialCode: dialCode(),
					flag: country.flag,
					key: {
						update: {
							text: country.name.common,
						},
					},
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
		task.title = `Countries (${i - 1} records)`
	} catch (err) {
		throw err
	}
}
