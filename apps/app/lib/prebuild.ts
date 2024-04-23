import { Listr, type ListrDefaultRenderer, type ListrTask as ListrTaskObj, PRESET_TIMER } from 'listr2'

import fs from 'fs'
import path from 'path'

import { getEnv } from '@weareinreach/env'

const rendererOptions = {
	bottomBar: 10,
	persistentOutput: true,
	timer: PRESET_TIMER,
} satisfies ListrJob['rendererOptions']
const injectOptions = (job: ListrJob): ListrJob => ({ ...job, rendererOptions })

const tasks = new Listr(
	[
		injectOptions({
			title: 'Inject CRON_KEY into vercel.json',
			task: (_, task) => {
				if (getEnv('VERCEL_ENV') !== 'production') {
					return task.skip(`${task.title} (Not production deployment)`)
				}
				const regex = /\{\{KEY\}\}/
				const vercelConfigFile = path.resolve(__dirname, '../vercel.json')
				const vercelConfig = fs.readFileSync(vercelConfigFile, 'utf8')
				return fs.writeFileSync(vercelConfigFile, vercelConfig.replace(regex, getEnv('CRON_KEY')))
			},
		}),
	],
	{
		rendererOptions: {
			formatOutput: 'wrap',
			timer: PRESET_TIMER,
			suffixSkips: true,
			collapseSubtasks: false,
		},
		fallbackRendererOptions: {
			timer: PRESET_TIMER,
		},
		exitOnError: false,
	}
)

tasks.run()

export type ListrJob = ListrTaskObj<unknown, ListrDefaultRenderer>
