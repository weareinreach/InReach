import type { ListrRenderer, ListrTaskWrapper } from 'listr2'

import { prisma } from '~/client'

import { generateEthnicities } from '../data/ethnicity'
import { logFile } from '../logger'

export const seedEthnicities = async (task: ListrTaskWrapper<unknown, typeof ListrRenderer>) => {
	try {
		const queue = await generateEthnicities()
		let i = 1
		for (const item of queue) {
			logFile.log(
				`(${i}/${queue.length}) Upserting Ethnicity: (${item.create.language?.connect?.localeCode}) ${item.create.ethnicity}`
			)
			task.output = `(${i}/${queue.length}) Upserting Ethnicity: (${item.create.language?.connect?.localeCode}) ${item.create.ethnicity}`

			await prisma.userEthnicity.upsert(item)
			i++
		}
	} catch (err) {
		throw err
	}
}
