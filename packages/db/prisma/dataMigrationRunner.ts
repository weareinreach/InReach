import {
	Listr,
	ListrTask as ListrTaskObj,
	ListrDefaultRenderer,
	ListrTaskWrapper,
	PRESET_TIMER,
} from 'listr2'

import {
	job20220329,
	job20220330,
	job20220404,
	job20230404b,
	job20230405,
	job20230405b,
	job20230406,
	job20230410,
	job20230410b,
	job20230411,
	job20230411b,
	job20230421,
} from './data-migrations'

/**
 * Job Queue
 *
 * Add new jobs to the end of this array.
 */
const jobList = [
	job20220329,
	job20220330,
	job20220404,
	job20230404b,
	job20230405,
	job20230405b,
	job20230406,
	job20230410,
	job20230410b,
	job20230411,
	job20230411b,
	job20230421,
]

/**
 * Job Runner
 *
 * You shouldn't need to touch anythign below this.
 */

const renderOptions = {
	bottomBar: 10,
	persistentOutput: true,
	timer: PRESET_TIMER,
} satisfies ListrJob['options']
const injectOptions = (job: ListrJob): ListrJob => ({ ...job, options: renderOptions })
const jobs = new Listr<Context>(
	jobList.map((job) => injectOptions(job)),
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
