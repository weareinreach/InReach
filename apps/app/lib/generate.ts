import { Command } from 'commander'
import { Listr, ListrContext, ListrRenderer, ListrTaskWrapper } from 'listr2'

import {
	// generateFooterLinks,
	// generateNavigation,
	// generateSocialMediaLinks,
	generateTranslationKeys,
} from 'lib/generators'

const program = new Command()

export type ListrTask = ListrTaskWrapper<unknown, typeof ListrRenderer>

const options = {
	bottomBar: 10,
	persistentOutput: true,
}
const translation = [
	{
		title: 'Translation definitions from DB',
		task: (_ctx: ListrContext, task: ListrTask) => generateTranslationKeys(task),
		options,
	},
]
const siteData = [
	// {
	// 	title: 'Navigation Links',
	// 	task: (_ctx: ListrContext, task: ListrTask) => generateNavigation(task),
	// 	options,
	// },
	// {
	// 	title: 'Footer Links',
	// 	task: (_ctx: ListrContext, task: ListrTask) => generateFooterLinks(task),
	// 	options,
	// },
	// {
	// 	title: 'Social Media Links',
	// 	task: (_ctx: ListrContext, task: ListrTask) => generateSocialMediaLinks(task),
	// 	options,
	// },
]

program
	.name('generate')
	.description('InReach App data generator')
	.option('-t, --translations', 'generate translation files only')
	.option('-d, --data', 'generate site data files only')

program.parse(process.argv)
const cliOpts = program.opts()
let tasklist = []

if (cliOpts.translations) tasklist.push(...translation)

// if (cliOpts.data) tasklist.push(...siteData)
if (Object.keys(cliOpts).length === 0) tasklist = [...translation /*...siteData*/]

const tasks = new Listr(tasklist)

tasks.run()
