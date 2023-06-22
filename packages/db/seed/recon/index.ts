import { Listr, PRESET_TIMER } from 'listr2'

import * as generators from './generator'
import { attachLogger } from './logger'
import { type Context, type ListrJob } from './types'

const renderOptions = {
	bottomBar: 10,
	persistentOutput: true,
	timer: PRESET_TIMER,
} satisfies ListrJob['options']
const injectOptions = (job: ListrJob): ListrJob => ({ ...job, options: renderOptions })

const jobs = new Listr<Context>(
	[
		injectOptions({
			title: 'Run generators',
			task: (_ctx, task) => {
				attachLogger(task)
				task.output = 'Running generators...'
				return task.newListr(Object.values(generators).map((job) => injectOptions(job)))
			},
		}),
	],
	{
		rendererOptions: {
			formatOutput: 'wrap',
			timer: PRESET_TIMER,
			suffixSkips: true,
		},
		fallbackRendererOptions: {
			timer: PRESET_TIMER,
		},
		exitOnError: false,
		forceColor: true,
	}
)

jobs.run()
