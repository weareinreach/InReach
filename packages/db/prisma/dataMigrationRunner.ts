/* eslint-disable node/no-process-env */

import {
	Listr,
	type ListrDefaultRenderer,
	type ListrTask as ListrTaskObj,
	type ListrTaskWrapper,
	PRESET_TIMER,
	PRESET_TIMESTAMP,
} from 'listr2'
import { type Promisable } from 'type-fest'

import { prisma } from '~db/client'
import { generateId } from '~db/lib/idGen'
import { downloadFromDatastore, formatMessage } from '~db/prisma/common'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

import * as jobList from './data-migrations'

/**
 * Job Runner
 *
 * You shouldn't need to touch anything in this file. All jobs in `data-migrations/index.ts` will be imported.
 */

const rendererOptions = {
	outputBar: 10,
	persistentOutput: true,
	timer: PRESET_TIMER,
} satisfies ListrJob['rendererOptions']

const injectOptions = (job: ListrJob): ListrJob => ({ ...job, rendererOptions })

const jobQueue: ListrJob[] = []

const jobs = new Listr<Context>(
	[
		{
			title: 'Determine jobs to run',
			task: async (ctx, task) => {
				if (process.env.GITHUB_ACTION) {
					return task.skip('Skipping migrations on GitHub Actions')
				}
				const jobsFromDb = await prisma.dataMigration.findMany({
					select: { jobId: true },
				})
				const completedJobs = jobsFromDb.map(({ jobId }) => jobId)
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
					ctx.jobCount = jobNamesToRun.length
					task.output = `${jobNamesToRun.length} migrations to run:\n▸ ${jobNamesToRun.join('\n▸ ')}`
					task.title = `Pending migrations: ${jobNamesToRun.length}`
				} else {
					task.title = 'No pending migrations to apply.'
				}
				return void 0
			},

			rendererOptions: { ...rendererOptions, timer: { condition: false, field: '' } },
		},
		{
			task: (ctx, task) => {
				task.title = `Applying ${ctx.jobCount ?? 0} pending migrations`
				return task.newListr(jobQueue)
			},
			enabled: (ctx) => !!ctx.pendingMigrations,
			rendererOptions,
		},
	],
	{
		ctx: {
			prisma,
			downloadFromDatastore,
			formatMessage,
			jobPostRunner,
			createLogger,
			generateId,
		},
		rendererOptions: {
			formatOutput: 'wrap',
			timer: PRESET_TIMER,
			suffixSkips: true,
			collapseSubtasks: false,
			removeEmptyLines: false,
		},
		fallbackRendererOptions: {
			timer: PRESET_TIMER,
			timestamp: PRESET_TIMESTAMP,
		},
		exitOnError: false,
	}
)

jobs.run()

export type Context = {
	error?: boolean
	pendingMigrations?: boolean
	jobCount?: number
	prisma: typeof prisma
	downloadFromDatastore: typeof downloadFromDatastore
	formatMessage: typeof formatMessage
	jobPostRunner: typeof jobPostRunner
	createLogger: typeof createLogger
	generateId: typeof generateId
}
export type PassedTask = ListrTaskWrapper<Context, ListrDefaultRenderer, ListrDefaultRenderer>
export type ListrJob = ListrTaskObj<Context, ListrDefaultRenderer>

export type MigrationJob = ListrJob & { def: JobDef }
export type ListrTask = (ctx: Context, task: PassedTask) => Promisable<void | Listr<Context>>
