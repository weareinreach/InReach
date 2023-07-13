/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	Listr,
	type ListrDefaultRenderer,
	type ListrTask as ListrTaskObj,
	type ListrTaskWrapper,
	PRESET_TIMER,
} from 'listr2'

import { prisma } from '~db/client'
import { type JobDef } from '~db/prisma/jobPreRun'

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

const jobQueue: ListrJob[] = []

const jobs = new Listr<Context>(
	[
		{
			title: 'Determine jobs to run',
			task: async (ctx, task) => {
				const jobs = await prisma.dataMigration.findMany({
					select: { jobId: true },
				})
				const completedJobs = jobs.map(({ jobId }) => jobId)
				task.output = `${Object.values(jobList).length} migrations found in ~db/prisma/data-migrations`

				const jobNamesToRun: string[] = []

				for (const { def, ...job } of Object.values(jobList)) {
					if (completedJobs.includes(def.jobId)) {
						continue
					}
					jobNamesToRun.push(def.jobId)
					jobQueue.push(injectOptions(job))
				}
				if (jobNamesToRun.length) {
					ctx.pendingMigrations = true
					task.output = `${jobNamesToRun.length} migrations to run:\n${jobNamesToRun.join('\n')}`
					task.title = `Pending migrations: ${jobNamesToRun.length}`
				} else {
					task.title = `No pending migrations`
				}
			},
			...renderOptions,
		},
		{
			title: `Apply ${jobQueue.length} pending migrations`,
			task: (_, task) => task.newListr(jobQueue),
			enabled: (ctx) => !!ctx.pendingMigrations,
			...renderOptions,
		},
		// ...Object.values(jobList).map((job) => injectOptions(job)),
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
		forceColor: true,
	}
)

jobs.run()

export type Context = {
	error?: boolean
	pendingMigrations?: boolean
}
export type PassedTask = ListrTaskWrapper<Context, ListrDefaultRenderer>
export type ListrJob = ListrTaskObj<Context, ListrDefaultRenderer>

export type MigrationJob = ListrJob & { def: JobDef }
export type ListrTask = (
	ctx: Context,
	task: PassedTask
) => void | Promise<void | Listr<Context, any, any>> | Listr<Context, any, any>
