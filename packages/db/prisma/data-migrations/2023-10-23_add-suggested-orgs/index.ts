import fs from 'fs'
import path from 'path'

import { prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
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

		// Disable for CI
		// eslint-disable-next-line node/no-process-env
		if (process.env.CI) return

		// Do stuff
		const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'out.json'), 'utf8')) as Output

		const translationKeys = await prisma.translationKey.createMany({
			data: data.translationKey,
			skipDuplicates: true,
		})
		log(`Created ${translationKeys.count} translation key records`)
		const freeText = await prisma.freeText.createMany({ data: data.freeText, skipDuplicates: true })
		log(`Created ${freeText.count} free text records`)

		const organizationNew = await prisma.organization.createMany({
			data: data.organizationNew,
			skipDuplicates: true,
		})
		log(`Created ${organizationNew.count} organization records`)
		const organizationUp = await prisma.$transaction(
			data.organizationUp.map((args) => prisma.organization.update(args))
		)
		log(`Updated ${organizationUp.length} organization records`)

		const orgLocation = await prisma.orgLocation.createMany({ data: data.orgLocation, skipDuplicates: true })
		log(`Created ${orgLocation.count} org location records`)
		const orgService = await prisma.orgService.createMany({ data: data.orgService, skipDuplicates: true })
		log(`Created ${orgService.count} org service records`)
		const orgEmail = await prisma.orgEmail.createMany({ data: data.orgEmail, skipDuplicates: true })
		log(`Created ${orgEmail.count} org email records`)
		const orgPhone = await prisma.orgPhone.createMany({ data: data.orgPhone, skipDuplicates: true })
		log(`Created ${orgPhone.count} org phone records`)

		const attributeSupplement = await prisma.attributeSupplement.createMany({
			data: data.attributeSupplement,
			skipDuplicates: true,
		})
		log(`Created ${attributeSupplement.count} attribute supplement records`)

		const serviceArea = await prisma.serviceArea.createMany({ data: data.serviceArea, skipDuplicates: true })
		log(`Created ${serviceArea.count} service area records`)
		const serviceAreaCountry = await prisma.serviceAreaCountry.createMany({
			data: data.serviceAreaCountry,
			skipDuplicates: true,
		})
		log(`Created ${serviceAreaCountry.count} service area country records`)
		const serviceAreaDist = await prisma.serviceAreaDist.createMany({
			data: data.serviceAreaDist,
			skipDuplicates: true,
		})
		log(`Created ${serviceAreaDist.count} service area dist records`)

		const orgServiceTag = await prisma.orgServiceTag.createMany({
			data: data.orgServiceTag,
			skipDuplicates: true,
		})
		log(`Created ${orgServiceTag.count} org service tag records`)

		const organizationAttribute = await prisma.organizationAttribute.createMany({
			data: data.organizationAttribute,
			skipDuplicates: true,
		})
		log(`Created ${organizationAttribute.count} organization attribute records`)
		const serviceAccessAttribute = await prisma.serviceAccessAttribute.createMany({
			data: data.serviceAccessAttribute,
			skipDuplicates: true,
		})
		log(`Created ${serviceAccessAttribute.count} service access attribute records`)
		const serviceAttribute = await prisma.serviceAttribute.createMany({
			data: data.serviceAttribute,
			skipDuplicates: true,
		})
		log(`Created ${serviceAttribute.count} service attribute records`)

		const orgServiceEmail = await prisma.orgServiceEmail.createMany({
			data: data.orgServiceEmail,
			skipDuplicates: true,
		})
		log(`Created ${orgServiceEmail.count} org service email records`)
		const orgServicePhone = await prisma.orgServicePhone.createMany({
			data: data.orgServicePhone,
			skipDuplicates: true,
		})
		log(`Created ${orgServicePhone.count} org service phone records`)
		const orgLocationEmail = await prisma.orgLocationEmail.createMany({
			data: data.orgLocationEmail,
			skipDuplicates: true,
		})
		log(`Created ${orgLocationEmail.count} org location email records`)
		const orgLocationPhone = await prisma.orgLocationPhone.createMany({
			data: data.orgLocationPhone,
			skipDuplicates: true,
		})
		log(`Created ${orgLocationPhone.count} org location phone records`)
		const orgLocationService = await prisma.orgLocationService.createMany({
			data: data.orgLocationService,
			skipDuplicates: true,
		})
		log(`Created ${orgLocationService.count} org location service records`)

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
