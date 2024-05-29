/* eslint-disable node/no-process-env */
import { PrismaClient } from '@prisma/client'
import {
	Listr,
	type ListrDefaultRenderer,
	type ListrSimpleRenderer,
	type ListrTask as ListrTaskObj,
	type ListrTaskWrapper,
	PRESET_TIMER,
} from 'listr2'
import prettier from 'prettier'

import { writeFileSync } from 'fs'
import path from 'path'

import * as job from './generators'

/**
 * It takes a filename and some data, and writes it to a file in the `generated` directory
 *
 * @param {string} filename - The base name of the file to write to, **without extension**.
 * @param {string} data - The data to be written to the file.
 */
export const writeOutput = async (filename: string, data: string, isJs = false) => {
	const prettierOpts = (await prettier.resolveConfig(__dirname)) ?? undefined
	const parser = isJs ? 'babel' : 'typescript'
	const outFile = `${path.resolve(__dirname, '../generated')}/${filename}.${isJs ? 'mjs' : 'ts'}`

	const formattedOutput = await prettier.format(data, { ...prettierOpts, parser })
	writeFileSync(outFile, formattedOutput)
}

const prisma = new PrismaClient()

const rendererOptions = {
	bottomBar: 10,
	timer: PRESET_TIMER,
}
const defineJob = (
	title: string,
	jobItem: (ctx: Context, task: ListrTask) => void | Promise<void>
): ListrJob => ({
	title,
	rendererOptions,
	task: jobItem,
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
					{ concurrent: true, ctx: { prisma, writeOutput } }
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
	prisma: typeof prisma
	writeOutput: typeof writeOutput
}
export type ListrTask = ListrTaskWrapper<Context, ListrDefaultRenderer, ListrSimpleRenderer>
type ListrJob = ListrTaskObj<Context, ListrDefaultRenderer>
