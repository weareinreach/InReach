import { generateEthnicityRecords } from '../data/03-ethnicity'
import { logFile } from '../logger'
import { type ListrTask } from '../starterData'

import { prisma } from '~db/index'
import { Log, iconList } from '~db/seed/lib'

export const seedEthnicities = async (task: ListrTask) => {
	const log: Log = (message, icon?, indent = false) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		logFile.info(formattedMessage)
		task.output = formattedMessage
	}

	const { ethnicity, translate } = generateEthnicityRecords(task)
	const translateResult = await prisma.translationKey.createMany({ data: translate, skipDuplicates: true })
	const ethnicityResult = await prisma.userEthnicity.createMany({ data: ethnicity, skipDuplicates: true })

	log(
		`${translateResult.count} successful translation keys, ${ethnicityResult.count} successful ethnicity records`,
		'create'
	)

	task.title = `Ethnicities (${ethnicityResult.count} records)`
}
