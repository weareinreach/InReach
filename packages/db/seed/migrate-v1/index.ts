import { Listr, ListrDefaultRenderer, ListrTaskWrapper } from 'listr2'

import { migrateOrgs } from '~/seed/migrate-v1/organization'
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
		task: (_ctx, task): Listr => migrateOrgs(task),
		options: renderOptions,
	},
])

tasks.run()

export type Context = {
	error?: boolean
}
export type ListrTask = ListrTaskWrapper<Context, ListrDefaultRenderer>
