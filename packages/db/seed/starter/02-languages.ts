import { type ListrRenderer, type ListrTaskWrapper } from 'listr2'

import { prisma } from '~db/index'
import { genSeedLanguageData } from '~db/seed/data/02-languages'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const seedLanguages = async (task: ListrTaskWrapper<any, typeof ListrRenderer>) => {
	const data = genSeedLanguageData(task)

	const result = await prisma.language.createMany({ data, skipDuplicates: true })
	task.title = `Languages (${result.count} records)`
}
