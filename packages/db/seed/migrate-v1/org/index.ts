import { Listr } from 'listr2'

import { Context, ListrTask, ListrTaskDef } from '~/seed/migrate-v1'

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
export const runMigrateOrgs = async (task: ListrTask, ctx: Context) =>
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
				task: async (_ctx, task): Promise<void> => translations(task, ctx),
				...taskOptions,
			},
			{
				title: 'Insert free text linking records',
				task: async (_ctx, task): Promise<void> => freetext(ctx, task),
				...taskOptions,
			},
			{
				title: 'Insert locations',
				task: async (_ctx, task): Promise<void> => locations(task, ctx),
				...taskOptions,
			},
			{
				title: 'Insert phone numbers',
				task: async (_ctx, task): Promise<void> => phones(task, ctx),
				...taskOptions,
			},
			{
				title: 'Insert emails',
				task: async (_ctx, task): Promise<void> => emails(task, ctx),
				...taskOptions,
			},
			{
				title: 'Insert websites',
				task: async (_ctx, task): Promise<void> => websites(task, ctx),
				...taskOptions,
			},
			{
				title: 'Insert social media',
				task: async (_ctx, task): Promise<void> => socials(task, ctx),
				...taskOptions,
			},
			{
				title: 'Insert outside API connections',
				task: async (_ctx, task): Promise<void> => apiConnections(task, ctx),
				...taskOptions,
			},
			{
				title: 'Insert photos',
				task: async (_ctx, task): Promise<void> => photos(task, ctx),
				...taskOptions,
			},
			{
				title: 'Insert operating hours',
				task: async (_ctx, task): Promise<void> => hours(task, ctx),
				...taskOptions,
			},
			{
				title: 'Insert services',
				task: async (_ctx, task): Promise<void> => services(task, ctx),
				...taskOptions,
			},
			{
				title: 'Insert service access',
				task: async (_ctx, task): Promise<void> => serviceAccess(task, ctx),
				...taskOptions,
			},
			{
				title: 'Insert attributes',
				task: async (_ctx, task): Promise<void> => attributes(task, ctx),
				...taskOptions,
			},
			{
				title: 'Insert attribute supplements',
				task: async (_ctx, task): Promise<void> => attributeSupplement(task, ctx),
				...taskOptions,
			},
			{
				title: 'Insert service areas ',
				task: async (_ctx, task): Promise<void> => servAreas(task, ctx),
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
