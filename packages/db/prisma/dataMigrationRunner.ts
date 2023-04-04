import { Listr, ListrTask as ListrTaskObj, ListrDefaultRenderer, ListrTaskWrapper } from 'listr2'

import { job20220329, job20220330, job20220404 } from './data-migrations'

const renderOptions = {
	bottomBar: 10,
	persistentOutput: true,
	showTimer: true,
} satisfies ListrJob['options']
const injectOptions = (job: ListrJob) => ({ ...job, renderOptions })

const jobs = new Listr<Context>(
	[injectOptions(job20220329), injectOptions(job20220330), injectOptions(job20220404)],
	{
		rendererOptions: {
			collapse: false,
			collapseErrors: false,
			collapseSkips: false,
			showTimer: true,
			formatOutput: 'wrap',
		},
		nonTTYRendererOptions: {
			useIcons: true,
		},
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
