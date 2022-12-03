import { prisma } from '~/index'

import type { ListrTask } from '.'
import { generateEthnicityRecords } from '../data/ethnicity'
import { logFile } from '../logger'

export const seedEthnicities = async (task: ListrTask) => {
	try {
		const ethnicities = await prisma.$transaction(generateEthnicityRecords(task))
		const logMessage = `Ethnicity bulk operation: ${ethnicities.length} successful transactions`
		logFile.log(logMessage)
		task.output = logMessage
		task.title = `Ethnicities (${ethnicities.length} records)`
	} catch (err) {
		throw err
	}
}
