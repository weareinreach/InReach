import { Listr, ListrTask as ListrBaseTask, ListrDefaultRenderer, ListrTaskWrapper } from 'listr2'

import { runMigrateOrgs } from '~/seed/migrate-v1/org'
import { runMigrateReviews } from '~/seed/migrate-v1/reviews'
import { migrateUsers } from '~/seed/migrate-v1/users'

const renderOptions: RenderOptions = {
	bottomBar: 10,
}

const tasks = new Listr<Context>(
	[
		{
			title: 'Migrate users',
			task: async (_ctx, task): Promise<void> => migrateUsers(task),
			options: renderOptions,
			skip: true,
		},
		{
			title: 'Migrate organizations',
			task: (_ctx, task): Listr => runMigrateOrgs(task),
			options: renderOptions,
		},
		{
			title: 'Migrate reviews',
			task: (_ctx, task): Listr => runMigrateReviews(task),
			options: renderOptions,
		},
	],
	{ nonTTYRendererOptions: { useIcons: true } }
)

tasks.run()

export type Context = {
	error?: boolean
}
export type RenderOptions = ListrBaseTask<Context, ListrDefaultRenderer>['options']
export type ListrTask = ListrTaskWrapper<Context, ListrDefaultRenderer>
