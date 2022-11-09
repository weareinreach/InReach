import { Listr, ListrRenderer, ListrTaskWrapper } from 'listr2'

import { seedSystemUser } from './01-user'
import { seedLanguages } from './02-languages'
import { seedEthnicities } from './03-ethnicities'
import { seedCountries } from './04-countries'

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
