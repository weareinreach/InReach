/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import { Listr, PRESET_TIMER } from 'listr2'

import { interactiveRun, updateGeoTask } from './dbRunner'
import { generateRecords, migrateOrgs } from './generator'

import { ListrTask, ListrTaskDef } from '~db/seed/migrate-v1'

const taskOptions: Omit<ListrTaskDef, 'title' | 'task'> = {
	options: {
		bottomBar: 20,
		timer: PRESET_TIMER,
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
				// skip: true,
			},
			{
				title: 'Run batch insertions',
				task: async (_ctx, task): Promise<void> => interactiveRun(task),
				...taskOptions,
				skip: false,
			},
			{
				title: 'Update GeoData table',
				task: async (_ctx, task): Promise<void> => updateGeoTask(task),
				...taskOptions,
				skip: false,
			},
		],
		{ collectErrors: 'full' }
	)
