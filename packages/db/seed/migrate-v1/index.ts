/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
	Listr,
	type ListrTask as ListrBaseTask,
	type ListrDefaultRenderer,
	type ListrTaskWrapper,
	PRESET_TIMER,
} from 'listr2'

import { migrateLog } from '~db/seed/logger'
import { runMigrateOrgs } from '~db/seed/migrate-v1/org'
// import { RollbackOrgs, rollbackOrgs } from '~db/seed/migrate-v1/org/dbRunner'
import { runMigrateReviews } from '~db/seed/migrate-v1/reviews'
import { migrateUsers } from '~db/seed/migrate-v1/users'

const taskOptions: Omit<ListrTaskDef, 'title' | 'task'> = {
	options: {
		bottomBar: 20,
		timer: PRESET_TIMER,
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
				timer: PRESET_TIMER,
				showErrorMessage: true,
				// collapse: false,
			},
		}
	)

	try {
		await tasks.run()
	} catch (error) {
		migrateLog.log('top level catch')
		migrateLog.error(error)
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