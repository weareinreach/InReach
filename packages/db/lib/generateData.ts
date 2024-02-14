/* eslint-disable node/no-process-env */
import {
	Listr,
	type ListrDefaultRenderer,
	type ListrSimpleRenderer,
	type ListrTask as ListrTaskObj,
	type ListrTaskWrapper,
	PRESET_TIMER,
} from 'listr2'

import { prisma } from '~db/client'

import * as job from './generators'

const rendererOptions = {
	bottomBar: 10,
	timer: PRESET_TIMER,
}
const defineJob = (title: string, job: (task: ListrTask) => void | Promise<void>): ListrJob => ({
	title,
	task: async (_ctx, task): Promise<void> => job(task),
	rendererOptions,
	skip: !process.env.DATABASE_URL,
})

const tasks = new Listr<Context>(
	[
		{
			title: 'Run generators',
			task: (_, task) =>
				task.newListr(
					[
						defineJob('User Permissions', job.generatePermissions),
						defineJob('User Roles', job.generateUserRoles),
						defineJob('User Types', job.generateUserTypes),
						defineJob('All Attributes', job.generateAllAttributes),
						defineJob('Attribute Categories', job.generateAttributeCategories),
						defineJob('Attributes By Category', job.generateAttributesByCategory),
						defineJob('Service Categories', job.generateServiceCategories),
						defineJob('Language lists', job.generateLanguageFiles),
						defineJob('Translation Namespaces', job.generateNamespaces),
						defineJob('Attribute Supplement Data Schemas', job.generateDataSchemas),
					],
					{ concurrent: true }
				),
		},
		{
			title: 'Close DB session',
			task: async () => prisma.$disconnect(),
		},
	],
	{
		exitOnError: false,
		fallbackRendererOptions: {
			timer: PRESET_TIMER,
		},
		rendererOptions: {
			timer: PRESET_TIMER,
			collapseErrors: false,
			formatOutput: 'wrap',
			collapseSubtasks: false,
			suffixSkips: true,
		},
	}
)

tasks.run()

export type Context = {
	error?: boolean
}
export type ListrTask = ListrTaskWrapper<Context, ListrDefaultRenderer, ListrSimpleRenderer>
type ListrJob = ListrTaskObj<Context, ListrDefaultRenderer>
