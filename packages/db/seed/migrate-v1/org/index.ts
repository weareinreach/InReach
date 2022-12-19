import { Listr } from 'listr2'

import { ListrTask, ListrTaskDef } from '~/seed/migrate-v1'

import {
	apiConnections,
	attributeSupplement,
	attributes,
	emails,
	freetext,
	hours,
	locations,
	orgConnections,
	phones,
	photos,
	servAreaConnections,
	servAreas,
	servConnections,
	serviceAccess,
	services,
	socials,
	translations,
	websites,
} from './dbRunner'
import { generateRecords, migrateOrgs } from './generator'

const taskOptions: Omit<ListrTaskDef, 'title' | 'task'> = {
	options: {
		bottomBar: 10,
		showTimer: true,
	},
}
export const runMigrateOrgs = async (task: ListrTask) =>
	task.newListr(
		[
			{
				title: 'Generate & create base organization records',
				task: async (_ctx, task): Promise<Listr> => migrateOrgs(task),
				...taskOptions,
			},
			{
				title: 'Generate supplemental organization records',
				task: async (_ctx, task): Promise<Listr> => generateRecords(task),
				...taskOptions,
			},
			{
				title: 'Insert translation keys',
				task: async (_ctx, task): Promise<void> => translations(task),
				...taskOptions,
			},
			{
				title: 'Insert free text linking records',
				task: async (ctx, task): Promise<void> => freetext(ctx, task),
				...taskOptions,
			},
			{
				title: 'Insert locations',
				task: async (_ctx, task): Promise<void> => locations(task),
				...taskOptions,
			},
			{
				title: 'Insert phone numbers',
				task: async (_ctx, task): Promise<void> => phones(task),
				...taskOptions,
			},
			{
				title: 'Insert emails',
				task: async (_ctx, task): Promise<void> => emails(task),
				...taskOptions,
			},
			{
				title: 'Insert websites',
				task: async (_ctx, task): Promise<void> => websites(task),
				...taskOptions,
			},
			{
				title: 'Insert social media',
				task: async (_ctx, task): Promise<void> => socials(task),
				...taskOptions,
			},
			{
				title: 'Insert outside API connections',
				task: async (_ctx, task): Promise<void> => apiConnections(task),
				...taskOptions,
			},
			{
				title: 'Insert photos',
				task: async (_ctx, task): Promise<void> => photos(task),
				...taskOptions,
			},
			{
				title: 'Insert operating hours',
				task: async (_ctx, task): Promise<void> => hours(task),
				...taskOptions,
			},
			{
				title: 'Insert services',
				task: async (_ctx, task): Promise<void> => services(task),
				...taskOptions,
			},
			{
				title: 'Insert service access',
				task: async (_ctx, task): Promise<void> => serviceAccess(task),
				...taskOptions,
			},
			{
				title: 'Insert attributes',
				task: async (_ctx, task): Promise<void> => attributes(task),
				...taskOptions,
			},
			{
				title: 'Insert attribute supplements',
				task: async (_ctx, task): Promise<void> => attributeSupplement(task),
				...taskOptions,
			},
			{
				title: 'Insert service areas ',
				task: async (_ctx, task): Promise<void> => servAreas(task),
				...taskOptions,
			},
			{
				title: 'Update service links',
				task: async (_ctx, task): Promise<void> => servConnections(task),
				...taskOptions,
			},
			{
				title: 'Update organization links',
				task: async (_ctx, task): Promise<void> => orgConnections(task),
				...taskOptions,
			},
			{
				title: 'Update service area links',
				task: async (_ctx, task): Promise<void> => servAreaConnections(task),
				...taskOptions,
			},
		],
		{ collectErrors: 'full' }
	)
