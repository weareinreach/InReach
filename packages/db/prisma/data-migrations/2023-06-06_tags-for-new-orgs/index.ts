import fs from 'fs'
import path from 'path'

import { Prisma, prisma } from '~db/index'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'

const getJSON = (file: string) => JSON.parse(fs.readFileSync(path.resolve(__dirname, file), 'utf-8'))

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-06-06_tags-for-new-orgs',
	title: 'Add tags for new orgs',
	createdBy: 'Joe Karow',
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
export const job20230606 = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: async (_ctx, task) => {
		/**
		 * Do not edit this part
		 *
		 * This ensures that jobs are only run once
		 */
		if (await jobPreRunner(jobDef, task)) {
			return task.skip(`${jobDef.jobId} - Migration has already been run.`)
		}
		/**
		 * Start defining your data migration from here.
		 *
		 * To log output, use `task.output = 'Message to log'`
		 *
		 * This will be written to `stdout` and to a log file in `/prisma/migration-logs/`
		 */

		// Do stuff
		const fileOrgAttributes = getJSON('data-orgAttributes.json')

		const dataOrgAttributes = Prisma.validator<Prisma.OrganizationAttributeCreateManyArgs>()({
			data: fileOrgAttributes,
			skipDuplicates: true,
		})
		const dataServAttributes = Prisma.validator<Prisma.ServiceAttributeCreateManyArgs>()({
			data: getJSON('data-servAttributes.json'),
			skipDuplicates: true,
		})
		const dataServiceTags = Prisma.validator<Prisma.OrgServiceTagCreateManyArgs>()({
			data: getJSON('data-serviceTags.json'),
			skipDuplicates: true,
		})

		const linkOrgAttributes = await prisma.organizationAttribute.createMany(dataOrgAttributes)
		const linkServAttributes = await prisma.serviceAttribute.createMany(dataServAttributes)
		const linkServiceTags = await prisma.orgServiceTag.createMany(dataServiceTags)
		task.output = `Created ${linkOrgAttributes.count} organization-attribute links`
		task.output = `Created ${linkServAttributes.count} service-attribute links`
		task.output = `Created ${linkServiceTags.count} service-tag links`

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
} satisfies ListrJob
