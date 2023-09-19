import fs from 'fs'
import path from 'path'

import { prisma, type Prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-09-19-add-orgs-trans-relo-support',
	title: 'add orgs - trans relo support',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/** Job export - this variable MUST be UNIQUE */
export const job20230919_add_orgs_trans_relo_support = {
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
		const newSource = await prisma.source.upsert({
			where: { id: 'srce_01HAQ0V94P842GWW1GBJC1FW1T' },
			update: {},
			create: {
				id: 'srce_01HAQ0V94P842GWW1GBJC1FW1T',
				source: 'spreadsheet upload',
				type: 'EXTERNAL',
				active: true,
			},
			select: { id: true, source: true },
		})
		log(`Created source: ${newSource.source} (${newSource.id})`)
		const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data.json'), 'utf-8')) as DataOutput
		await prisma.$transaction(
			async (db) => {
				const translationKey = await db.translationKey.createMany({
					data: data.translationKey,
					skipDuplicates: true,
				})
				log(`Created ${translationKey.count} translation keys`)
				const freeText = await db.freeText.createMany({
					data: data.freeText,
					skipDuplicates: true,
				})
				log(`Created ${freeText.count} freeText records`)
				const organization = await db.organization.createMany({
					data: data.organization,
					skipDuplicates: true,
				})
				log(`Created ${organization.count} organization records`)
				const orgWebsite = await db.orgWebsite.createMany({
					data: data.orgWebsite,
					skipDuplicates: true,
				})
				log(`Created ${orgWebsite.count} orgWebsite records`)
				const orgSocialMedia = await db.orgSocialMedia.createMany({
					data: data.orgSocialMedia,
					skipDuplicates: true,
				})
				log(`Created ${orgSocialMedia.count} orgSocialMedia records`)
				const orgEmail = await db.orgEmail.createMany({
					data: data.orgEmail,
					skipDuplicates: true,
				})
				log(`Created ${orgEmail.count} orgEmail records`)
				const organizationEmail = await db.organizationEmail.createMany({
					data: data.organizationEmail,
					skipDuplicates: true,
				})
				log(`Created ${organizationEmail.count} organizationEmail records`)
				const orgLocation = await db.orgLocation.createMany({
					data: data.orgLocation,
					skipDuplicates: true,
				})
				log(`Created ${orgLocation.count} orgLocation records`)
				const orgService = await db.orgService.createMany({
					data: data.orgService,
					skipDuplicates: true,
				})
				log(`Created ${orgService.count} orgService records`)
				const orgServiceTag = await db.orgServiceTag.createMany({
					data: data.orgServiceTag,
					skipDuplicates: true,
				})
				log(`Created ${orgServiceTag.count} orgServiceTag records`)
				const serviceArea = await db.serviceArea.createMany({
					data: data.serviceArea,
					skipDuplicates: true,
				})
				log(`Created ${serviceArea.count} serviceArea records`)
				const orgLocationService = await db.orgLocationService.createMany({
					data: data.orgLocationService,
					skipDuplicates: true,
				})
				log(`Created ${orgLocationService.count} orgLocationService records`)
				const serviceAreaCountry = await db.serviceAreaCountry.createMany({
					data: data.serviceAreaCountry,
					skipDuplicates: true,
				})
				log(`Created ${serviceAreaCountry.count} serviceAreaCountry records`)
				const organizationAttribute = await db.organizationAttribute.createMany({
					data: data.organizationAttribute,
					skipDuplicates: true,
				})
				log(`Created ${organizationAttribute.count} organizationAttribute records`)
				const serviceAccessAttribute = await db.serviceAccessAttribute.createMany({
					data: data.serviceAccessAttribute,
					skipDuplicates: true,
				})
				log(`Created ${serviceAccessAttribute.count} serviceAccessAttribute records`)
				const serviceAttribute = await db.serviceAttribute.createMany({
					data: data.serviceAttribute,
					skipDuplicates: true,
				})
				log(`Created ${serviceAttribute.count} serviceAttribute records`)
				const attributeSupplement = await db.attributeSupplement.createMany({
					data: data.attributeSupplement,
					skipDuplicates: true,
				})
				log(`Created ${attributeSupplement.count} attributeSupplement records`)
			},
			{ timeout: 300000 }
		)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob

type DataOutput = {
	translationKey: Prisma.TranslationKeyCreateManyInput[]
	freeText: Prisma.FreeTextCreateManyInput[]
	organization: Prisma.OrganizationCreateManyInput[]
	orgWebsite: Prisma.OrgWebsiteCreateManyInput[]
	attributeSupplement: Prisma.AttributeSupplementCreateManyInput[]
	organizationAttribute: Prisma.OrganizationAttributeCreateManyInput[]
	orgSocialMedia: Prisma.OrgSocialMediaCreateManyInput[]
	orgEmail: Prisma.OrgEmailCreateManyInput[]
	organizationEmail: Prisma.OrganizationEmailCreateManyInput[]
	orgService: Prisma.OrgServiceCreateManyInput[]
	orgServiceTag: Prisma.OrgServiceTagCreateManyInput[]
	serviceArea: Prisma.ServiceAreaCreateManyInput[]
	serviceAreaCountry: Prisma.ServiceAreaCountryCreateManyInput[]
	serviceAccessAttribute: Prisma.ServiceAccessAttributeCreateManyInput[]
	serviceAttribute: Prisma.ServiceAttributeCreateManyInput[]
	orgLocation: Prisma.OrgLocationCreateManyInput[]
	orgLocationService: Prisma.OrgLocationServiceCreateManyInput[]
}
