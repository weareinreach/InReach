import { Listr, ListrTask as ListrBaseTask, ListrDefaultRenderer, ListrTaskWrapper, Logger } from 'listr2'

import { migrateLog } from '~/seed/logger'
import { runMigrateOrgs } from '~/seed/migrate-v1/org'
// import { RollbackOrgs, rollbackOrgs } from '~/seed/migrate-v1/org/dbRunner'
import { runMigrateReviews } from '~/seed/migrate-v1/reviews'
import { migrateUsers } from '~/seed/migrate-v1/users'

const logger = new Logger({ useIcons: true })

const taskOptions: Omit<ListrTaskDef, 'title' | 'task'> = {
	options: {
		bottomBar: 20,
		showTimer: true,
	},
}
async function run() {
	migrateLog.log('Start migration.')
	const tasks = new Listr<Context>(
		[
			{
				title: 'Migrate users',
				task: async (_ctx, task): Promise<void> => migrateUsers(task),
				...taskOptions,
				// skip: true,
			},
			{
				title: 'Migrate organizations',
				task: async (ctx, task): Promise<Listr> => runMigrateOrgs(task),
				...taskOptions,
				// rollback: async (ctx, task): Promise<void> => runRollback(task, ctx),
				// skip: true,
			},
			{
				title: 'Migrate reviews',
				task: async (_ctx, task): Promise<Listr> => runMigrateReviews(task),
				...taskOptions,
			},
		],
		{
			collectErrors: 'full',
			rendererOptions: {
				collapseErrors: false,
				formatOutput: 'wrap',
				clearOutput: false,
				showSubtasks: true,
				showTimer: true,
				showErrorMessage: true,
				// collapse: false,
			},
		}
	)

	const job = await tasks.run()
	try {
	} catch (error) {
		migrateLog.log('top level catch')
		migrateLog.error(error)
		migrateLog.error(job)
		logger.fail(JSON.stringify(error))
		throw error
	}
}
run()
export type Context = {
	error?: boolean
	step: string
}
export type ListrTaskDef = ListrBaseTask<Context, ListrDefaultRenderer>
export type RenderOptions = ListrTaskDef['options']
export type ListrTask = ListrTaskWrapper<Context, ListrDefaultRenderer>
