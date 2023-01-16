import { type ListrRenderer, type ListrTaskWrapper } from 'listr2'

import { genSeedLanguageData } from '../data/02-languages'

import { prisma } from '~/index'

export const seedLanguages = async (task: ListrTaskWrapper<unknown, typeof ListrRenderer>) => {
	try {
		const data = genSeedLanguageData(task)

		const result = await prisma.language.createMany({ data, skipDuplicates: true })
		task.title = `Languages (${result.count} records)`
	} catch (err) {
		throw err
	}
}
