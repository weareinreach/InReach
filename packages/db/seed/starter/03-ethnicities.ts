import { prisma } from '~/index'
import { Log, iconList } from '~/seed/lib'

import { generateEthnicityRecords } from '../data/03-ethnicity'
import { logFile } from '../logger'
import type { ListrTask } from '../starterData'

export const seedEthnicities = async (task: ListrTask) => {
	try {
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
	} catch (err) {
		throw err
	}
}
