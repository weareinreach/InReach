import type { ListrRenderer, ListrTaskWrapper } from 'listr2'

import { prisma } from '~/index'

import { genSeedLanguageData } from '../data/02-languages'

export const seedLanguages = async (task: ListrTaskWrapper<unknown, typeof ListrRenderer>) => {
	try {
		const data = genSeedLanguageData(task)

		const result = await prisma.language.createMany({ data, skipDuplicates: true })
		task.title = `Languages (${result.count} records)`
	} catch (err) {
		throw err
	}
}
