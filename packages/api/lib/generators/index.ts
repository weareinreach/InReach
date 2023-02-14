import { Listr, ListrRenderer, ListrTaskWrapper } from 'listr2'

import { generateAttributeCategories } from './attributeCategory'
import { generatePermissions } from './permission'
import { generateServiceCategories } from './serviceCategory'
import { generateUserRoles } from './userRole'
import { generateUserTypes } from './userType'

const renderOptions = {
	bottomBar: 10,
}

const tasks = new Listr<Context>([
	{
		title: 'User Permissions',
		task: async (_ctx, task): Promise<void> => generatePermissions(task),
		options: renderOptions,
	},
	{
		title: 'User Roles',
		task: async (_ctx, task): Promise<void> => generateUserRoles(task),
		options: renderOptions,
	},
	{
		title: 'User Types',
		task: async (_ctx, task): Promise<void> => generateUserTypes(task),
		options: renderOptions,
	},
	{
		title: 'Attribute Categories',
		task: async (_ctx, task): Promise<void> => generateAttributeCategories(task),
		options: renderOptions,
	},
	{
		title: 'Service Categories',
		task: async (_ctx, task): Promise<void> => generateServiceCategories(task),
		options: renderOptions,
	},
])

tasks.run()

export type Context = {
	error?: boolean
}
export type ListrTask = ListrTaskWrapper<unknown, typeof ListrRenderer>
