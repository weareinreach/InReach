import { Listr } from 'listr2'

import { ListrTask, ListrTaskDef } from '~/seed/migrate-v1'

import { interactiveRun } from './dbRunner'
import { generateRecords, migrateOrgs } from './generator'

const taskOptions: Omit<ListrTaskDef, 'title' | 'task'> = {
	options: {
		bottomBar: 20,
		showTimer: true,
	},
	// skip: true,
}
export const runMigrateOrgs = async (task: ListrTask) =>
	task.newListr(
		[
			{
				title: 'Generate & create base organization records',
				task: async (_ctx, task): Promise<Listr> => migrateOrgs(task),
				...taskOptions,
				// skip: true,
			},
			{
				title: 'Generate supplemental organization records',
				task: async (_ctx, task): Promise<Listr> => generateRecords(task),
				...taskOptions,
				skip: false,
			},
			{
				title: 'Run batch insertions',
				task: async (_ctx, task): Promise<void> => interactiveRun(task),
				...taskOptions,
				skip: false,
			},
		],
		{ collectErrors: 'full' }
	)
