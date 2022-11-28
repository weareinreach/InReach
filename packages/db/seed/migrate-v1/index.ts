import { Listr, ListrDefaultRenderer, ListrTaskWrapper } from 'listr2'

import { migrateUsers } from '~/seed/migrate-v1/users'

const renderOptions = {
	bottomBar: 10,
}

const tasks = new Listr<Context>([
	{
		title: 'Migrate User Database',
		task: async (_ctx, task): Promise<void> => migrateUsers(task),
		options: renderOptions,
	},
])

tasks.run()

export type Context = {
	error?: boolean
}
export type ListrTask = ListrTaskWrapper<unknown, ListrDefaultRenderer>
