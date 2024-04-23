/* eslint-disable node/no-process-env */
import { Command } from 'commander'
import {
	Listr,
	type ListrContext,
	type ListrDefaultRenderer,
	type ListrSimpleRenderer,
	type ListrTask,
	type ListrTaskWrapper,
} from 'listr2'

import { generateTranslationKeys } from 'lib/generators'

const program = new Command()

export type PassedTask = ListrTaskWrapper<unknown, ListrDefaultRenderer, ListrSimpleRenderer>

const options = {
	bottomBar: 10,
	persistentOutput: true,
}
const translation = [
	{
		title: 'Translation definitions from DB',
		task: (_ctx: ListrContext, task: PassedTask) => generateTranslationKeys(task),
		skip: !process.env.DATABASE_URL,
		options,
	},
]

program
	.name('generate')
	.description('InReach App data generator')
	.option('-t, --translations', 'generate translation files only')

program.parse(process.argv)
const cliOpts = program.opts()
let tasklist: ListrJob[] = []

if (cliOpts.translations) {
	tasklist.push(...translation)
}

if (Object.keys(cliOpts).length === 0) {
	tasklist = [...translation]
}

const tasks = new Listr(tasklist, {
	exitOnError: false,
})

tasks.run()

type ListrJob = ListrTask<unknown, ListrDefaultRenderer>
