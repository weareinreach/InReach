import { Listr, ListrTask as ListrTaskObj, ListrDefaultRenderer, ListrTaskWrapper } from 'listr2'

import {
	job20220329,
	job20220330,
	job20220404,
	job20230404b,
	job20230405,
	job20230405b,
	job20230406,
} from './data-migrations'

/**
 * Job Queue
 *
 * Add new jobs to the end of this array.
 */
const jobList = [job20220329, job20220330, job20220404, job20230404b, job20230405, job20230405b, job20230406]

/**
 * Job Runner
 *
 * You shouldn't need to touch anythign below this.
 */

const renderOptions = {
	bottomBar: 10,
	persistentOutput: true,
	showTimer: true,
} satisfies ListrJob['options']
const injectOptions = (job: ListrJob): ListrJob => ({ ...job, options: renderOptions })
const jobs = new Listr<Context>(
	jobList.map((job) => injectOptions(job)),
	{
		rendererOptions: {
			showTimer: true,
			formatOutput: 'wrap',
		},
		nonTTYRendererOptions: {
			useIcons: true,
			showTimer: true,
		},

		exitOnError: false,
	}
)

jobs.run()

export type Context = {
	error?: boolean
}
export type ListrJob = ListrTaskObj<Context, ListrDefaultRenderer>
export type ListrTask = (
	ctx: Context,
	task: ListrTaskWrapper<Context, ListrDefaultRenderer>
) => void | Promise<void>
