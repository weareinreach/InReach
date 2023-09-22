import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-09-22-update-alerts',
	title: 'update alerts',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}

const Schema = z.object({
	deactivate: z.object({ attributeId: z.string(), organizationId: z.string() }).array(),
	updateText: z.object({ key: z.string(), text: z.string() }).array(),
})
/** Job export - this variable MUST be UNIQUE */
export const job20230922_update_alerts = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (_ctx, task) => {
		/** Create logging instance */
		createLogger(task, jobDef.jobId)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))
		/**
		 * Start defining your data migration from here.
		 *
		 * To log output, use `task.output = 'Message to log'`
		 *
		 * This will be written to `stdout` and to a log file in `/prisma/migration-logs/`
		 */

		// Do stuff
		const { deactivate, updateText } = Schema.parse(
			JSON.parse(fs.readFileSync(path.resolve(__dirname, './data.json'), 'utf-8'))
		)

		const deactivatedAlerts = await prisma.$transaction(
			deactivate.map((ids) =>
				prisma.organizationAttribute.update({
					where: { organizationId_attributeId: ids },
					data: { active: false },
				})
			)
		)

		log(`Deactivated alerts: ${deactivatedAlerts.length}`)

		const updatedAlertText = await prisma.$transaction(
			updateText.map(({ key, text }) =>
				prisma.translationKey.update({ where: { ns_key: { key, ns: 'org-data' } }, data: { text } })
			)
		)
		log(`Alerts updated: ${updatedAlertText.length}`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
