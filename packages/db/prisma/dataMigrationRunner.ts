import { Listr, ListrTask as ListrTaskObj, ListrDefaultRenderer, ListrTaskWrapper } from 'listr2'

import { job20220329 } from './data-migrations'

const renderOptions = {
	bottomBar: 10,
}
const injectOptions = (job: ListrJob) => ({ ...job, renderOptions })

const jobs = new Listr<Context>([injectOptions(job20220329)], {
	rendererOptions: {
		collapse: false,
		showTimer: true,
		collapseErrors: false,
		formatOutput: 'wrap',
	},
	collectErrors: 'full',
	nonTTYRendererOptions: {
		useIcons: true,
	},
})

jobs.run()

export type Context = {
	error?: boolean
}
export type ListrJob = ListrTaskObj<Context, ListrDefaultRenderer>
export type ListrTask = (
	ctx: Context,
	task: ListrTaskWrapper<Context, ListrDefaultRenderer>
) => void | Promise<void>
