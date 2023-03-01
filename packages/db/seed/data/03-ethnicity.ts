import { keySlug, namespaces } from './00-namespaces'

import { Prisma, generateId } from '~db/index'
import { Log, iconList } from '~db/seed/lib'
import { logFile } from '~db/seed/logger'
import { ListrTask } from '~db/seed/starterData'

type EthnicityData = string[]

const ethnicityData: EthnicityData = [
	'Black',
	'Middle Eastern/North African',
	'Asian',
	'Latino/a/x/Hispanic',
	'South Asian',
	'Biracial/Multiracial',
	'American Indian/Native American/Indigenous Person',
	'Native Hawaiian/Pacific Islander',
	'White',
	'Other',
	'Prefer not to say',
]
type GenEthnicityData = {
	ethnicity: Prisma.UserEthnicityCreateManyInput[]
	translate: Prisma.TranslationKeyCreateManyInput[]
}

export const generateEthnicityRecords = (task: ListrTask) => {
	const log: Log = (message, icon?, indent = false) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		logFile.info(formattedMessage)
		task.output = formattedMessage
	}
	const data: GenEthnicityData = {
		ethnicity: [],
		translate: [],
	}
	let i = 0
	for (const item of ethnicityData) {
		log(`(${i}/${ethnicityData.length}) Generating Ethnicity record: ${item}`, 'generate')
		log(`Translation key: eth-${keySlug(item)}`, 'tlate', true)
		const key = `eth-${keySlug(item)}`
		data.translate.push({
			key,
			ns: namespaces.user,
			text: item,
		})
		log(`Ethnicity record: ${item}`, 'generate', true)
		data.ethnicity.push({
			id: generateId('userEthnicity', 0),
			ethnicity: item,
			tsKey: key,
			tsNs: namespaces.user,
		})
		i++
	}
	return data
}
