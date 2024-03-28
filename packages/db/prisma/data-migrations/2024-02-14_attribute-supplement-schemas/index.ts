import { prisma, type Prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'
import { type FieldAttributes, FieldType } from '~db/zod_util/attributeSupplement'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-02-14_attribute-supplement-schemas',
	title: 'attribute supplement schemas',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240214_attribute_supplement_schemas = {
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
		const deleted = await prisma.attributeSupplementDataSchema.deleteMany({
			where: {
				id: {
					in: [
						'asds_01GW2HHH9NFEXHG9RHBTM9NRFR',
						'asds_01GW2HHH9PKJ6H9WFSNZSVK2G4',
						'asds_01GW2HHH9P7J5A1CBGN6B5QCG7',
						'asds_01GW2HHH9PN6MJ4ZS7D17G1YTK',
						'asds_01GW2HHH9PSSYV7TKFA6DY68P4',
					],
				},
			},
		})

		log(`Deleted ${deleted.count} records.`)

		const updateData: SchemaUpdate[] = [
			{
				data: {
					definition: [
						{ key: 'min', label: 'Min', name: 'min', type: FieldType.number },
						{ key: 'max', label: 'Max', name: 'max', type: FieldType.number },
					],
					// tag: 'numMinMaxOrRange',
				},
				where: {
					id: 'asds_01GYX872BWWCGTZREHDT2AFF9D',
				},
			},
			{
				data: {
					definition: [
						{ key: 'min', label: 'Min', name: 'min', type: FieldType.number },
						{ key: 'max', label: 'Max', name: 'max', type: FieldType.number },
					],
					// tag: 'numRange',
				},
				where: {
					id: 'asds_01GYX872BYZQ6CC344S1SWTJ97',
				},
			},
			{
				data: {
					definition: [{ key: 'min', label: 'Min', name: 'min', type: FieldType.number }],
					// tag: 'numMin',
				},
				where: {
					id: 'asds_01GYX872BZE4TN1MJHMTGVAYZ0',
				},
			},
			{
				data: {
					definition: [{ key: 'max', label: 'Max', name: 'max', type: FieldType.number }],
					// tag: 'numMax',
				},
				where: {
					id: 'asds_01GYX872BZNT0F6WH50XJQWM9G',
				},
			},
			{
				data: {
					definition: [{ key: 'num', label: 'Number', name: 'num', type: FieldType.number }],
					// tag: 'number',
				},
				where: {
					id: 'asds_01GYX872BZKJPVH6VHC0ABFH8A',
				},
			},
			{
				data: {
					definition: [
						{
							key: 'incompatible',
							label: 'Incompatible',
							name: 'incompatible',
							type: FieldType.text,
						},
					],
					// tag: 'incompatibleData',
				},
				where: {
					id: 'asds_01GYX872BZSMTHYM4HYYTCENZM',
				},
			},
			{
				data: {
					definition: [{ key: 'other', label: 'Other', name: 'other', type: FieldType.text }],
					// tag: 'otherDescribe',
				},
				where: {
					id: 'asds_01GYX872BZ7V6VQ3NE6KSVVRKH',
				},
			},
		]
		const updates = await prisma.$transaction(
			updateData.map((args) =>
				prisma.attributeSupplementDataSchema.update(
					args as unknown as Prisma.AttributeSupplementDataSchemaUpdateArgs
				)
			)
		)
		log(`Updated ${updates.length} records.`)
		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob

type SchemaUpdate = {
	where: { id: string }
	data: {
		definition: FieldAttributes | FieldAttributes[]
	}
}
