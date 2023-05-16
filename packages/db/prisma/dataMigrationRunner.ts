import {
	Listr,
	type ListrDefaultRenderer,
	type ListrTask as ListrTaskObj,
	type ListrTaskWrapper,
	PRESET_TIMER,
} from 'listr2'

import * as jobList from './data-migrations'

/**
 * Job Runner
 *
 * You shouldn't need to touch anything in this file. All jobs in `data-migrations/index.ts` will be imported.
 */

const renderOptions = {
	bottomBar: 10,
	persistentOutput: true,
	timer: PRESET_TIMER,
} satisfies ListrJob['options']
const injectOptions = (job: ListrJob): ListrJob => ({ ...job, options: renderOptions })
const jobs = new Listr<Context>(
	Object.values(jobList).map((job) => injectOptions(job)),
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
	}
)

jobs.run()

export type Context = {
	error?: boolean
}
export type PassedTask = ListrTaskWrapper<Context, ListrDefaultRenderer>
export type ListrJob = ListrTaskObj<Context, ListrDefaultRenderer>
export type ListrTask = (ctx: Context, task: PassedTask) => void | Promise<void>
