import { parsePhoneNumberFromString } from 'libphonenumber-js'

import { type Prisma, prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-11-15-phone-number-corrections',
	title: 'phone number corrections',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
const orgPhones = [
	'ophn_01HDQ1X4FY03H7SSHY0PDRNCTE',
	'ophn_01HDQ1W6GBV08FCQN6DNH6V4XP',
	'ophn_01HDQ1WDK50R77QYCJ4004J5R5',
	'ophn_01HDQ1WEP9EE1ZCME5PE7VFKFQ',
	'ophn_01HDQ1WV1MNAQKJ23P13GC9VKC',
	'ophn_01HDQ1WT9FR6XQQJN9M9CQ60A3',
	'ophn_01HDQ1XFP8FFB9S3MXD7BRWJZA',
	'ophn_01HDQ1XJQ242TACA7E5NPJVVDV',
	'ophn_01HDQ1XEJZK95CG315QGGHCZWJ',
	'ophn_01HDQ1X80AG7BPAYD52BZTRKR4',
	'ophn_01HDQ1W6WPJQZTDVRTS5PYS6Z3',
	'ophn_01HDQ1W9VEBPRM50YJ0SEWQX5Q',
	'ophn_01HDQ1WBWTN70JM792QH79TCA1',
	'ophn_01HDQ1WEPA926N4MASG0GEPWQD',
	'ophn_01HDQ1W8VPDZ250RRZFPCAXR67',
]
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20231115_phone_number_corrections = {
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

		const originalData = await prisma.orgPhone.findMany({
			where: { id: { in: orgPhones } },
			select: {
				id: true,
				number: true,
			},
		})
		const updates: Prisma.OrgPhoneUpdateArgs[] = originalData.map(({ id, number }) => {
			const parsedPhone = parsePhoneNumberFromString(number, 'US')
			if (!parsedPhone) {
				throw new Error('Cannot parse phone number')
			}

			return {
				where: { id },
				data: {
					number: parsedPhone.nationalNumber,
				},
			}
		})
		const results = await prisma.$transaction(updates.map((args) => prisma.orgPhone.update(args)))
		log(`Updated ${results.length} phone numbers`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
