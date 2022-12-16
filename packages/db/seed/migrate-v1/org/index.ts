import { ListrTask } from '~/seed/migrate-v1'

import {
	apiConnections,
	attributeSupplement,
	attributes,
	emails,
	hours,
	locations,
	orgConnections,
	phones,
	photos,
	servAreas,
	servConnections,
	serviceAccess,
	services,
	socials,
	translations,
	websites,
} from './dbRunner'
import { generateRecords, migrateOrgs } from './generator'

const renderOptions = {
	bottomBar: 10,
}
export const runMigrateOrgs = (task: ListrTask) =>
	task.newListr([
		{
			title: 'Generate & create base organization records',
			task: async (_ctx, task): Promise<void> => migrateOrgs(task),
			options: renderOptions,
			skip: true,
		},
		{
			title: 'Generate supplemental organization records',
			task: async (_ctx, task): Promise<void> => generateRecords(task),
			options: renderOptions,
		},
		{
			title: 'Insert translation keys',
			task: async (_ctx, task): Promise<void> => translations(task),
			options: renderOptions,
		},
		{
			title: 'Insert locations',
			task: async (_ctx, task): Promise<void> => locations(task),
			options: renderOptions,
		},
		{
			title: 'Insert phone numbers',
			task: async (_ctx, task): Promise<void> => phones(task),
			options: renderOptions,
		},
		{
			title: 'Insert emails',
			task: async (_ctx, task): Promise<void> => emails(task),
			options: renderOptions,
		},
		{
			title: 'Insert websites',
			task: async (_ctx, task): Promise<void> => websites(task),
			options: renderOptions,
		},
		{
			title: 'Insert social media',
			task: async (_ctx, task): Promise<void> => socials(task),
			options: renderOptions,
		},
		{
			title: 'Insert outside API connections',
			task: async (_ctx, task): Promise<void> => apiConnections(task),
			options: renderOptions,
		},
		{
			title: 'Insert photos',
			task: async (_ctx, task): Promise<void> => photos(task),
			options: renderOptions,
		},
		{
			title: 'Insert operating hours',
			task: async (_ctx, task): Promise<void> => hours(task),
			options: renderOptions,
		},
		{
			title: 'Insert services',
			task: async (_ctx, task): Promise<void> => services(task),
			options: renderOptions,
		},
		{
			title: 'Insert service access',
			task: async (_ctx, task): Promise<void> => serviceAccess(task),
			options: renderOptions,
		},
		{
			title: 'Insert attributes',
			task: async (_ctx, task): Promise<void> => attributes(task),
			options: renderOptions,
		},
		{
			title: 'Insert attribute supplements',
			task: async (_ctx, task): Promise<void> => attributeSupplement(task),
			options: renderOptions,
		},
		{
			title: 'Upsert service areas ',
			task: async (_ctx, task): Promise<void> => servAreas(task),
			options: renderOptions,
		},
		{
			title: 'Update service links',
			task: async (_ctx, task): Promise<void> => servConnections(task),
			options: renderOptions,
		},
		{
			title: 'Update organization links',
			task: async (_ctx, task): Promise<void> => orgConnections(task),
			options: renderOptions,
		},
	])
