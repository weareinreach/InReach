import type { ListrRenderer, ListrTaskWrapper } from 'listr2'

import { prisma } from '~/index'

import { seedLanguageData } from '../data/02-languages'
import { logFile } from '../logger'

export const seedLanguages = async (task: ListrTaskWrapper<unknown, typeof ListrRenderer>) => {
	try {
		let logMessage = ''
		let i = 1
		for (const item of seedLanguageData) {
			logMessage = `(${i}/${seedLanguageData.length}) Upserting Language: ${item.create.languageName} (${item.create.nativeName})`
			logFile.log(logMessage)
			task.output = logMessage
			await prisma.language.upsert(item)
			i++
		}
		task.title = `Languages (${i - 1} records)`
	} catch (err) {
		throw err
	}
}
