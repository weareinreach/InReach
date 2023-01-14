/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { namespaces } from '../data/00-namespaces'
import { type Countries, countryData, genDemonymKey } from '../data/04-countries'

import { Prisma } from '~/client'
import { logFile } from '../logger'

import { prisma } from '~/index'
import { ListrTask } from '../starterData'

import { Log, iconList } from '~/seed/lib'
import { isSuccess } from '~/seed/migrate-v1/org/generator'

const translationNamespace = namespaces.country

type Data = {
	country: Prisma.CountryCreateManyInput[]
	translation: Prisma.TranslationKeyCreateManyInput[]
	translationChild: Prisma.TranslationKeyCreateManyInput[]
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
	try {
		const { countries } = await countryData()

		let i = 1
		const data: Data = {
			country: [],
			translation: [],
			translationChild: [],
		}
		for (const country of countries) {
			const { demonymOne, demonymOther } = genDemonymKey(country)

			if (demonymOne) {
				data.translation.push(demonymOne)

				data.translationChild.push(demonymOther)
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
				demonymKey: demonymOne?.key,
				demonymNs: demonymOne?.ns,
			})

			log(
				`(${i}/${countries.length}) Prepare Country record: ${country.name.common} - Demonym: ${isSuccess(
					!!demonymOne
				)}`
			)
			i++
		}
		const translation = await prisma.translationKey.createMany({
			data: data.translation,
			skipDuplicates: true,
		})
		const translationChild = await prisma.translationKey.createMany({
			data: data.translationChild,
			skipDuplicates: true,
		})
		const result = await prisma.country.createMany({ data: data.country, skipDuplicates: true })
		const translateTotal = translation.count + translationChild.count

		task.title = `Countries (${result.count} records, ${translateTotal} translation keys)`
	} catch (err) {
		throw err
	}
}
