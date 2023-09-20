import superjson from 'superjson'
import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { type Prisma, prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'
import { JsonInputOrNull } from '~db/zod_util'
/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-09-20-fix-access-instructions',
	title: 'fix access instructions',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
const Schema = z.object({ id: z.string(), data: z.string() }).array()
/** Job export - this variable MUST be UNIQUE */
export const job20230920_fix_access_instructions = {
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
		const data = Schema.parse(JSON.parse(fs.readFileSync(path.resolve(__dirname, './data.json'), 'utf-8')))

		const transactions: Prisma.AttributeSupplementUpdateArgs[] = []

		for (const record of data) {
			const existingData = superjson.parse<AccessData>(record.data)
			transactions.push({
				where: { id: record.id },
				data: {
					data: JsonInputOrNull.parse(superjson.serialize({ ...existingData, instructions: '' })),
				},
			})
		}
		const updates = await prisma.$transaction(
			transactions.map((args) => prisma.attributeSupplement.update(args))
		)
		log(`Updates submitted: ${transactions.length}, Updates processed: ${updates.length}`)

		const fixText = await prisma.translationKey.update({
			where: {
				ns_key: {
					ns: 'org-data',
					key: 'orgn_01HAQH1AQEMC7SB28G53Q8VK80.attribute.atts_01HAQH1AQMV8DMRYZPGE74WPDN',
				},
			},
			data: {
				text: '- Must be a Transgender/ Non-binary individual\n- Must be currently living in a state where gender affirming care is at risk\n- Must be able to retain employment/ attain consistent income\n- Must be eligible to rent\n- Cannot have a violent crime on record\n- Must be able to provide personal references (friends, co-workers, or family)',
			},
		})
		log(`Fixed text formatting for ${fixText.key}`)

		const serviceUpdate = await prisma.serviceTag.update({
			where: { id: 'svtg_01GW2HHFBQ817GKC3K6D6JGMVC' },
			data: { name: 'Gender affirming items', key: { update: { text: 'Gender affirming items' } } },
		})
		log(`Updated service tag ${serviceUpdate.id}`)
		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob

type AccessData = {
	access_type: string
	access_value: string
}
