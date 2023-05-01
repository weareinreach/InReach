import { prisma } from '~db/index'
import { migrateLog } from '~db/seed/logger'
import { ListrTask } from '~db/seed/migrate-v1'

import { generateReviews, orgReviews } from './generator'

const renderOptions = {
	bottomBar: 10,
}
const createReviews = async (task: ListrTask) => {
	const log = (message: string) => {
		migrateLog.info(message)
		task.output = message
	}
	const result = await prisma.orgReview.createMany({
		data: orgReviews,
		skipDuplicates: true,
	})
	log(`💾 Review records generated: ${result.count}`)
	task.title = `Create review records in database. (${result.count} records)`
}

export const runMigrateReviews = (task: ListrTask) =>
	task.newListr([
		{
			title: 'Generate review records',
			task: async (_ctx, task): Promise<void> => generateReviews(task),
			options: renderOptions,
		},
		{
			title: 'Create review records in database.',
			task: async (_ctx, task): Promise<void> => createReviews(task),
			options: renderOptions,
			skip: !!orgReviews.length,
		},
	])
