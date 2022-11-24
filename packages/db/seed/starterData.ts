import { Listr, ListrRenderer, ListrTaskWrapper } from 'listr2'

import {
	seedAttributes,
	seedCountries,
	seedEthnicities,
	seedFooterLinks,
	seedGeoData,
	seedLanguages,
	seedNavigation,
	seedSOGIdentity,
	seedServices,
	seedSocialMediaLinks,
	seedSystemUser,
	seedUserImmigration,
} from '~/seed/starter'

const renderOptions = {
	bottomBar: 10,
}

const tasks = new Listr<Context>(
	[
		{
			title: 'Seeding basic data...',
			task: (_ctx, task): Listr =>
				task.newListr([
					{
						title: 'System user',
						task: async (_ctx, task): Promise<void> => seedSystemUser(task),
						options: renderOptions,
					},
					{
						title: 'Languages',
						task: async (_ctx, task): Promise<void> => seedLanguages(task),
						options: renderOptions,
					},
					{
						title: 'Ethnicities',
						task: async (_ctx, task): Promise<void> => seedEthnicities(task),
						options: renderOptions,
					},
					{
						title: 'Countries',
						task: async (_ctx, task): Promise<void> => seedCountries(task),
						options: renderOptions,
					},
					{
						title: 'Navigation Bar Links',
						task: async (_ctx, task): Promise<void> => seedNavigation(task),
						options: renderOptions,
					},
					{
						title: 'Footer Links',
						task: async (_ctx, task): Promise<void> => seedFooterLinks(task),
						options: renderOptions,
					},
					{
						title: 'Social Media Links',
						task: async (_ctx, task): Promise<void> => seedSocialMediaLinks(task),
						options: renderOptions,
					},
					{
						title: 'Service Categories & Tags',
						task: async (_ctx, task): Promise<void> => seedServices(task),
						options: renderOptions,
					},
					{
						title: 'Attribute Categories & Attributes',
						task: async (_ctx, task): Promise<void> => seedAttributes(task),
						options: renderOptions,
					},
					{
						title: 'SOG/Identity',
						task: async (_ctx, task): Promise<void> => seedSOGIdentity(task),
						options: renderOptions,
					},
					{
						title: 'User Immigration Status',
						task: async (_ctx, task): Promise<void> => seedUserImmigration(task),
						options: renderOptions,
					},
					{
						title: 'Governing Districts & GeoJSON',
						task: async (_ctx, task): Promise<Listr> => seedGeoData(task),
						options: renderOptions,
					},
				]),
			options: renderOptions,
		},
	],
	{
		rendererOptions: {
			collapse: false,
			showTimer: true,
		},
	}
)

tasks.run()

export type Context = {
	error?: boolean
}
export type ListrTask = ListrTaskWrapper<unknown, typeof ListrRenderer>
