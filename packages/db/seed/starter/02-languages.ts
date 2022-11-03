import type { ListrRenderer, ListrTaskWrapper } from 'listr2'

import { prisma } from '~/client'

import { seedLanguageData } from '../data/languages'
import { logFile } from '../logger'

export const seedLanguages = async (task: ListrTaskWrapper<unknown, typeof ListrRenderer>) => {
	try {
		let i = 1
		for (const item of seedLanguageData) {
			logFile.log(`(${i}/${seedLanguageData.length}) Upserting Language: ${item.create.languageName}`)
			task.output = `(${i}/${seedLanguageData.length}) Upserting Language: ${item.create.languageName}`
			await prisma.language.upsert(item)
			i++
		}
	} catch (err) {
		throw err
	}
}
