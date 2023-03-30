/* eslint-disable node/no-process-env */
import { Listr, ListrRenderer, ListrTaskWrapper } from 'listr2'

import { generateAttributeCategories } from './attributeCategory'
import { generateAttributesByCategory } from './attributesByCategory'
import { generateLanguageFiles } from './langs'
import { generatePermissions } from './permission'
import { generateServiceCategories } from './serviceCategory'
import { generateUserRoles } from './userRole'
import { generateUserTypes } from './userType'

const renderOptions = {
	bottomBar: 10,
	showTimer: true,
}

const tasks = new Listr<Context>(
	[
		{
			title: 'User Permissions',
			task: async (_ctx, task): Promise<void> => generatePermissions(task),
			options: renderOptions,
			skip: !process.env.DATABASE_URL,
		},
		{
			title: 'User Roles',
			task: async (_ctx, task): Promise<void> => generateUserRoles(task),
			options: renderOptions,
			skip: !process.env.DATABASE_URL,
		},
		{
			title: 'User Types',
			task: async (_ctx, task): Promise<void> => generateUserTypes(task),
			options: renderOptions,
			skip: !process.env.DATABASE_URL,
		},
		{
			title: 'Attribute Categories',
			task: async (_ctx, task): Promise<void> => generateAttributeCategories(task),
			options: renderOptions,
			skip: !process.env.DATABASE_URL,
		},
		{
			title: 'Attributes By Category',
			task: async (_ctx, task): Promise<void> => generateAttributesByCategory(task),
			options: renderOptions,
			skip: !process.env.DATABASE_URL,
		},
		{
			title: 'Service Categories',
			task: async (_ctx, task): Promise<void> => generateServiceCategories(task),
			options: renderOptions,
			skip: !process.env.DATABASE_URL,
		},
		{
			title: 'Language lists',
			task: async (_ctx, task): Promise<void> => generateLanguageFiles(task),
			options: renderOptions,
			skip: !process.env.DATABASE_URL,
		},
	],
	{
		exitOnError: false,
		nonTTYRendererOptions: {
			useIcons: true,
			showTimer: true,
		},
		rendererOptions: {
			showTimer: true,
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
