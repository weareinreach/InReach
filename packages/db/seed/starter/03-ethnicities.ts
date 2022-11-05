import type { ListrTask } from '.'

import { prisma } from '~/client'

import { generateEthnicityRecords, generateTranslations } from '../data/ethnicity'
import { getPrimaryLanguages } from '../data/languages'
import { logFile } from '../logger'

export const seedEthnicities = async (task: ListrTask) => {
	try {
		const ethnicities = await prisma.$transaction(generateEthnicityRecords(task))
		let logMessage = `Ethnicity bulk operation: ${ethnicities.length} successful transactions`
		logFile.log(logMessage)
		task.output = logMessage
		const languageList = await getPrimaryLanguages()
		const translations = await prisma.$transaction(generateTranslations(ethnicities, languageList, task))
		logMessage = `Translation bulk operation: ${translations.length} successful transactions`
		logFile.log(logMessage)
		task.output = logMessage
	} catch (err) {
		throw err
	}
}
