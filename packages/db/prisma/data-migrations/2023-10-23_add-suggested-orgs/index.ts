import { prisma } from '~db/client'
import { downloadFromDatastore, formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

import { type Output } from './!prep'
/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-10-23-add-suggested-orgs',
	title: 'add suggested orgs',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/** Job export - this variable MUST be UNIQUE */
export const job20231023_add_suggested_orgs = {
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
		log(`Downloading data from datastore`)
		const data = (await downloadFromDatastore(
			'migrations/2023-10-23_add-suggested-orgs/data.json',
			log
		)) as Output
		const translationKeys = await prisma.translationKey.createMany({
			data: data.translationKey,
			skipDuplicates: true,
		})
		log(`Translation Keys -- Submitted: ${data.translationKey.length}, Created: ${translationKeys.count}`)
		const freeText = await prisma.freeText.createMany({ data: data.freeText, skipDuplicates: true })
		log(`Free Text -- Submitted: ${data.freeText.length}, Created: ${freeText.count}`)

		const organizationNew = await prisma.organization.createMany({
			data: data.organizationNew,
			skipDuplicates: true,
		})
		log(`Organizations -- Submitted: ${data.organizationNew.length}, Created: ${organizationNew.count}`)
		const organizationUp = await prisma.$transaction(
			data.organizationUp.map((args) => prisma.organization.update(args))
		)
		log(`Updated ${organizationUp.length} organization records`)

		const orgLocation = await prisma.orgLocation.createMany({ data: data.orgLocation, skipDuplicates: true })
		log(`OrgLocation -- Submitted: ${data.orgLocation.length}, Created: ${orgLocation.count}`)
		const orgService = await prisma.orgService.createMany({ data: data.orgService, skipDuplicates: true })
		log(`OrgService -- Submitted: ${data.orgService.length}, Created: ${orgService.count}`)
		const orgEmail = await prisma.orgEmail.createMany({ data: data.orgEmail, skipDuplicates: true })
		log(`OrgEmail -- Submitted: ${data.orgEmail.length}, Created: ${orgEmail.count}`)
		const orgPhone = await prisma.orgPhone.createMany({ data: data.orgPhone, skipDuplicates: true })
		log(`OrgPhone -- Submitted: ${data.orgPhone.length}, Created: ${orgPhone.count}`)

		const serviceArea = await prisma.serviceArea.createMany({ data: data.serviceArea, skipDuplicates: true })
		log(`ServiceArea -- Submitted: ${data.serviceArea.length}, Created: ${serviceArea.count}`)
		const serviceAreaCountry = await prisma.serviceAreaCountry.createMany({
			data: data.serviceAreaCountry,
			skipDuplicates: true,
		})
		log(
			`ServiceAreaCountry -- Submitted: ${data.serviceAreaCountry.length}, Created: ${serviceAreaCountry.count}`
		)
		const serviceAreaDist = await prisma.serviceAreaDist.createMany({
			data: data.serviceAreaDist,
			skipDuplicates: true,
		})
		log(`ServiceAreaDist -- Submitted: ${data.serviceAreaDist.length}, Created: ${serviceAreaDist.count}`)

		const orgServiceTag = await prisma.orgServiceTag.createMany({
			data: data.orgServiceTag,
			skipDuplicates: true,
		})
		log(`OrgServiceTag -- Submitted: ${data.orgServiceTag.length}, Created: ${orgServiceTag.count}`)

		const organizationAttribute = await prisma.organizationAttribute.createMany({
			data: data.organizationAttribute,
			skipDuplicates: true,
		})
		log(
			`OrganizationAttribute -- Submitted: ${data.organizationAttribute.length}, Created: ${organizationAttribute.count}`
		)
		const serviceAttribute = await prisma.serviceAttribute.createMany({
			data: data.serviceAttribute,
			skipDuplicates: true,
		})
		log(`ServiceAttribute -- Submitted: ${data.serviceAttribute.length}, Created: ${serviceAttribute.count}`)
		const serviceAccessAttribute = await prisma.serviceAccessAttribute.createMany({
			data: data.serviceAccessAttribute,
			skipDuplicates: true,
		})
		log(
			`ServiceAccessAttribute -- Submitted: ${data.serviceAccessAttribute.length}, Created: ${serviceAccessAttribute.count}`
		)

		const attributeSupplement = await prisma.attributeSupplement.createMany({
			data: data.attributeSupplement,
			skipDuplicates: true,
		})
		log(
			`AttributeSupplement -- Submitted: ${data.attributeSupplement.length}, Created: ${attributeSupplement.count}`
		)

		const orgServiceEmail = await prisma.orgServiceEmail.createMany({
			data: data.orgServiceEmail,
			skipDuplicates: true,
		})
		log(`OrgServiceEmail -- Submitted: ${data.orgServiceEmail.length}, Created: ${orgServiceEmail.count}`)
		const orgServicePhone = await prisma.orgServicePhone.createMany({
			data: data.orgServicePhone,
			skipDuplicates: true,
		})
		log(`OrgServicePhone -- Submitted: ${data.orgServicePhone.length}, Created: ${orgServicePhone.count}`)
		const orgLocationEmail = await prisma.orgLocationEmail.createMany({
			data: data.orgLocationEmail,
			skipDuplicates: true,
		})
		log(`OrgLocationEmail -- Submitted: ${data.orgLocationEmail.length}, Created: ${orgLocationEmail.count}`)
		const orgLocationPhone = await prisma.orgLocationPhone.createMany({
			data: data.orgLocationPhone,
			skipDuplicates: true,
		})
		log(`OrgLocationPhone -- Submitted: ${data.orgLocationPhone.length}, Created: ${orgLocationPhone.count}`)
		const orgLocationService = await prisma.orgLocationService.createMany({
			data: data.orgLocationService,
			skipDuplicates: true,
		})
		log(
			`OrgLocationService -- Submitted: ${data.orgLocationService.length}, Created: ${orgLocationService.count}`
		)

		const handledSuggestions = await prisma.suggestion.updateMany(data.handledSuggestions)
		log(`Marked ${handledSuggestions.count} suggestions as 'handled'`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
