/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { prisma, Prisma } from '~db/index'
import { namespaces } from '~db/seed/data/00-namespaces'
import { type Countries, countryData, genDemonymKey } from '~db/seed/data/04-countries'
import { Log, iconList } from '~db/seed/lib'
import { logFile } from '~db/seed/logger'
import { isSuccess } from '~db/seed/migrate-v1/org/generator'
import { ListrTask } from '~db/seed/starterData'

const translationNamespace = namespaces.country

type Data = {
	country: Prisma.CountryCreateManyInput[]
	translation: Prisma.TranslationKeyCreateManyInput[]
}
export const seedCountries = async (task: ListrTask) => {
	const log: Log = (message, icon?, indent = false) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		logFile.info(formattedMessage)
		task.output = formattedMessage
	}
	const dialCode = (country: Countries) => {
		if (typeof country.idd.root !== 'number') return undefined
		if (country.idd.suffixes.length === 1) return parseInt(`${country.idd.root}${country.idd.suffixes[0]}`)
		return parseInt(country.idd.root)
	}
	const { countries } = await countryData()

	let i = 1
	const data: Data = {
		country: [],
		translation: [],
	}
	for (const country of countries) {
		const demonym = genDemonymKey(country)

		if (demonym) {
			data.translation.push(demonym)
		}

		data.translation.push({
			key: `${country.cca3}.name`,
			text: country.name.common,
			ns: translationNamespace,
		})
		data.country.push({
			cca2: country.cca2,
			cca3: country.cca3,
			name: country.name.common,
			dialCode: dialCode(country),
			flag: country.flag,
			tsKey: `${country.cca3}.name`,
			tsNs: translationNamespace,
			demonymKey: demonym?.key,
			demonymNs: demonym?.ns,
		})

		log(
			`(${i}/${countries.length}) Prepare Country record: ${country.name.common} - Demonym: ${isSuccess(
				!!demonym
			)}`
		)
		i++
	}
	const translation = await prisma.translationKey.createMany({
		data: data.translation,
		skipDuplicates: true,
	})

	const result = await prisma.country.createMany({ data: data.country, skipDuplicates: true })

	task.title = `Countries (${result.count} records, ${translation.count} translation keys)`
}
