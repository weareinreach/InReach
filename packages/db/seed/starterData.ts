/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Listr, ListrRenderer, ListrTaskWrapper, PRESET_TIMER } from 'listr2'

import {
	seedAttributes,
	seedCountries,
	seedEthnicities,
	seedGeoData,
	seedLanguages,
	seedOutsideAPI,
	seedPermissions,
	seedSOGIdentity,
	seedServices,
	seedSocialMediaLinks,
	seedSystemUser,
	seedTranslationNamespaces,
	seedUserImmigration,
	seedUserRoles,
	seedUserTypes,
} from '~db/seed/starter'

const renderOptions = {
	bottomBar: 10,
}
const skip = !!process.env.SEED_UPDATE

const tasks = new Listr<Context>(
	[
		{
			title: 'Seeding basic data...',
			task: (_ctx, task): Listr =>
				task.newListr([
					{
						title: 'Translation Namespaces',
						task: async (_ctx, task): Promise<void> => seedTranslationNamespaces(task),
						options: renderOptions,
					},
					{
						title: 'User Roles',
						task: async (_ctx, task): Promise<void> => seedUserRoles(task),
						options: renderOptions,
					},
					{
						title: 'User Types',
						task: async (_ctx, task): Promise<void> => seedUserTypes(task),
						options: renderOptions,
					},
					{
						title: 'System user',
						task: async (_ctx, task): Promise<void> => seedSystemUser(task),
						options: renderOptions,
						skip,
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
						skip,
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
						skip,
					},
					{
						title: 'Outside API Services',
						task: async (_ctx, task): Promise<void> => seedOutsideAPI(task),
						options: renderOptions,
					},
					{
						title: 'Permissions',
						task: async (_ctx, task): Promise<void> => seedPermissions(task),
						options: renderOptions,
					},
				]),
			options: renderOptions,
		},
	],
	{
		rendererOptions: {
			timer: PRESET_TIMER,
		},
	}
)

tasks.run()

export type Context = {
	error?: boolean
}
export type ListrTask = ListrTaskWrapper<unknown, typeof ListrRenderer>
