/* eslint-disable node/no-process-env */
import {
	Listr,
	type ListrDefaultRenderer,
	type ListrRenderer,
	type ListrTask as ListrTaskObj,
	type ListrTaskWrapper,
	PRESET_TIMER,
} from 'listr2'

import { generateAttributeCategories } from './attributeCategory'
import { generateAttributesByCategory } from './attributesByCategory'
import { generateLanguageFiles } from './langs'
import { generateNamespaces } from './namespaces'
import { generatePermissions } from './permission'
import { generateServiceCategories } from './serviceCategory'
import { generateUserRoles } from './userRole'
import { generateUserTypes } from './userType'

const renderOptions = {
	bottomBar: 10,
	timer: PRESET_TIMER,
}
const defineJob = (title: string, job: (task: ListrTask) => void | Promise<void>): ListrJob => ({
	title,
	task: async (_ctx, task): Promise<void> => job(task),
	options: renderOptions,
	skip: !process.env.DATABASE_URL,
})

const tasks = new Listr<Context>(
	[
		defineJob('User Permissions', generatePermissions),
		defineJob('User Roles', generateUserRoles),
		defineJob('User Types', generateUserTypes),
		defineJob('Attribute Categories', generateAttributeCategories),
		defineJob('Attributes By Category', generateAttributesByCategory),
		defineJob('Service Categories', generateServiceCategories),
		defineJob('Language lists', generateLanguageFiles),
		defineJob('Translation Namespaces', generateNamespaces),
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
		},
	}
)

tasks.run()

export type Context = {
	error?: boolean
}
export type ListrTask = ListrTaskWrapper<unknown, typeof ListrRenderer>
type ListrJob = ListrTaskObj<Context, ListrDefaultRenderer>
