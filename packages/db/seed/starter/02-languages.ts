import { type ListrRenderer, type ListrTaskWrapper } from 'listr2'

import { prisma } from '~db/index'
import { genSeedLanguageData } from '~db/seed/data/02-languages'

export const seedLanguages = async (task: ListrTaskWrapper<unknown, typeof ListrRenderer>) => {
	const data = genSeedLanguageData(task)

	const result = await prisma.language.createMany({ data, skipDuplicates: true })
	task.title = `Languages (${result.count} records)`
}
