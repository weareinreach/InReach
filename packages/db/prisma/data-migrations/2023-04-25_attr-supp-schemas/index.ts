/* eslint-disable deprecation/deprecation */
import { prisma } from '~db/index'
import { type ListrJob, type ListrTask, type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'

import { schemaMapping, schemas } from './!schemas'
/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-04-25-attrib-supp-schemas',
	title: 'Attribute supplement data schemas',
	createdBy: 'Joe Karow',
}

const job: ListrTask = async (_ctx, task) => {
	/** Do not edit this part - this ensures that jobs are only run once */
	if (await jobPreRunner(jobDef, task)) {
		return task.skip(`${jobDef.jobId} - Migration has already been run.`)
	}

	const createdSchemas = await prisma.attributeSupplementDataSchema.createMany({
		data: schemas,
		skipDuplicates: true,
	})
	task.output = `Schema definition records: ${createdSchemas.count}`

	const mappedSchemas = await prisma.$transaction(
		schemaMapping.map((args) => prisma.attribute.updateMany(args))
	)

	task.output = `Attribute Schemas mapped: ${mappedSchemas.reduce((prev, curr) => prev + curr.count, 0)}`
	/**
	 * DO NOT REMOVE BELOW - This writes a record to the DB to register that this migration has run
	 * successfully.
	 */
	await jobPostRunner(jobDef)
}

/**
 * Job export - this variable MUST be UNIQUE
 *
 * Use the format `jobYYYYMMDD` and append a letter afterwards if there is already a job with this name.
 *
 * @example `job20230404`
 *
 * @example `job20230404b`
 */
export const job20230425 = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: job,
	def: jobDef,
} satisfies MigrationJob
