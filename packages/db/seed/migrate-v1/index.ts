import { Listr, ListrDefaultRenderer, ListrTaskWrapper } from 'listr2'

import { runMigrateOrgs } from '~/seed/migrate-v1/org'
import { migrateUsers } from '~/seed/migrate-v1/users'

const renderOptions = {
	bottomBar: 10,
}

const tasks = new Listr<Context>([
	{
		title: 'Migrate User Database',
		task: async (_ctx, task): Promise<void> => migrateUsers(task),
		options: renderOptions,
		skip: true,
	},
	{
		title: 'Migrate Organization Database',
		task: (_ctx, task): Listr => runMigrateOrgs(task),
		options: renderOptions,
	},
])

tasks.run()

export type Context = {
	error?: boolean
}
export type ListrTask = ListrTaskWrapper<Context, ListrDefaultRenderer>
