import superjson from 'superjson'
import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma, type Prisma } from '~db/client'
import { namespace } from '~db/generated/namespaces'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'
import { JsonInputOrNull } from '~db/zod_util'

import { intlData } from './!data'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-07-24_add-crisis-resources',
	title: 'Add Crisis Support Resources',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}

const CountrySchema = z.string().array()

/**
 * Job export - this variable MUST be UNIQUE
 *
 * Use the format `jobYYYYMMDD` and append a letter afterwards if there is already a job with this name.
 *
 * @example `job20230404`
 *
 * @example `job20230404b`
 */
export const job20230724a = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
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

		const countries = CountrySchema.parse(
			JSON.parse(fs.readFileSync(path.resolve(__dirname, 'countries.json'), 'utf-8'))
		)

		// Create Services & Category
		const translationKeys = await prisma.translationKey.createMany({
			data: [
				{
					ns: namespace.services,
					key: 'international-support.CATEGORTYNAME',
					text: 'International Support',
				},
				{
					ns: namespace.services,
					key: 'international-support.resettlement-assistance',
					text: 'Resettlement Assistance',
				},
				{
					ns: namespace.services,
					key: 'international-support.mental-health',
					text: 'Mental Health',
				},
				{
					ns: namespace.services,
					key: 'international-support.financial-assistance',
					text: 'Financial Assistance',
				},
			],
			skipDuplicates: true,
		})

		const servCat = await prisma.serviceCategory.upsert({
			where: { id: 'svct_01H64G5CDDYVMADBGTS0TPWF86' },
			create: {
				id: 'svct_01H64G5CDDYVMADBGTS0TPWF86',
				category: 'International Support',
				active: true,
				activeForSuggest: false,
				tsKey: 'international-support.CATEGORTYNAME',
				tsNs: namespace.services,
			},
			update: {},
		})
		const services = await prisma.serviceTag.createMany({
			data: [
				{
					id: 'svtg_01H64GVYCYZBWXBSKK8WX2D7NJ',
					categoryId: servCat.id,
					name: 'Resettlement Assistance',
					tsKey: 'international-support.resettlement-assistance',
					tsNs: namespace.services,
					active: true,
				},
				{
					id: 'svtg_01H64GWD9JR68SJWYFC9TBK290',
					categoryId: servCat.id,
					name: 'Mental Health',
					tsKey: 'international-support.mental-health',
					tsNs: namespace.services,
					active: true,
				},
				{
					id: 'svtg_01H64GX7989A4T26WH1H6566DG',
					categoryId: servCat.id,
					name: 'Financial Assistance',
					tsKey: 'international-support.financial-assistance',
					tsNs: namespace.services,
					active: true,
				},
			],
			skipDuplicates: true,
		})

		log(
			`Created ${services.count} service tags & ${translationKeys.count} translation keys for ${servCat.category}`
		)

		// Create International Crisis Resources

		const intlRecords: IntlRecords = {
			translationKey: [],
			freeText: [],
			organization: [],
			orgService: [],
			serviceAccessAttribute: [],
			organizationAttribute: [],
			attributeSupplement: [],
			serviceArea: [],
			serviceAreaCountry: [],
			orgServiceTag: [],
		}

		for (const record of intlData) {
			intlRecords.translationKey.push(
				{
					key: `${record.orgId}.description`,
					ns: namespace.orgData,
					text: record.description,
				},
				{
					key: `${record.orgId}.attribute.${record.eligSuppId}`,
					ns: namespace.orgData,
					text: record.serves,
				}
			)
			intlRecords.freeText.push(
				{
					key: `${record.orgId}.description`,
					ns: namespace.orgData,
					id: record.ftDescId,
				},
				{
					key: `${record.orgId}.attribute.${record.eligSuppId}`,
					ns: namespace.orgData,
					id: record.ftServesId,
				}
			)
			intlRecords.organization.push({
				id: record.orgId,
				name: record.name,
				slug: record.slug,
				sourceId: 'srce_01H3FR96DFKRAM07AZ8T8MXHE5',
				crisisResource: true,
				published: true,
				descriptionId: record.ftDescId,
			})
			intlRecords.orgService.push({
				id: record.svcId,
				published: true,
				organizationId: record.orgId,
			})
			intlRecords.serviceAccessAttribute.push(
				...record.svcAcc.map((svc) => ({
					attributeId:
						svc.type === 'email'
							? 'attr_01GW2HHFVKFM4TDY4QRK4AR2ZW'
							: svc.type === 'link'
							? 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD'
							: 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0',
					serviceId: record.svcId,
				}))
			)
			intlRecords.organizationAttribute.push({
				attributeId: 'attr_01GW2HHFVJDKVF1HV7559CNZCY',
				organizationId: record.orgId,
				active: true,
			})
			intlRecords.attributeSupplement.push(
				{
					id: record.eligSuppId,
					active: true,
					textId: record.ftServesId,
					organizationAttributeOrganizationId: record.orgId,
					organizationAttributeAttributeId: 'attr_01GW2HHFVJDKVF1HV7559CNZCY',
				},
				...record.svcAcc.map((svc) => ({
					id: svc.id,
					serviceAccessAttributeAttributeId:
						svc.type === 'email'
							? 'attr_01GW2HHFVKFM4TDY4QRK4AR2ZW'
							: svc.type === 'link'
							? 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD'
							: 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0',
					serviceAccessAttributeServiceId: record.svcId,
					data: JsonInputOrNull.parse(
						superjson.serialize({ access_type: svc.type, access_value: svc.value })
					),
				}))
			)
			intlRecords.serviceArea.push({
				id: record.servAreaId,
				organizationId: record.orgId,
				active: true,
			})
			intlRecords.serviceAreaCountry.push(
				...countries.map((c) => ({ serviceAreaId: record.servAreaId, countryId: c, active: true }))
			)
			intlRecords.orgServiceTag.push(...record.svcTags.map((tagId) => ({ tagId, serviceId: record.svcId })))
		}

		const intlTKey = await prisma.translationKey.createMany({
			data: intlRecords.translationKey,
			skipDuplicates: true,
		})
		log(`Created ${intlTKey.count} translation keys`)
		const intlFText = await prisma.freeText.createMany({
			data: intlRecords.freeText,
			skipDuplicates: true,
		})
		log(`Created ${intlFText.count} freetext records`)
		const intlOrgs = await prisma.organization.createMany({
			data: intlRecords.organization,
			skipDuplicates: true,
		})
		log(`Created ${intlOrgs.count} organization records`)
		const intlSvc = await prisma.orgService.createMany({
			data: intlRecords.orgService,
			skipDuplicates: true,
		})
		log(`Created ${intlSvc.count} org service records`)
		const intlSvcAcc = await prisma.serviceAccessAttribute.createMany({
			data: intlRecords.serviceAccessAttribute,
			skipDuplicates: true,
		})
		log(`Created ${intlSvcAcc.count} service access attribute records`)
		const intlOrgAttr = await prisma.organizationAttribute.createMany({
			data: intlRecords.organizationAttribute,
			skipDuplicates: true,
		})
		log(`Created ${intlOrgAttr.count} organization attribute records`)
		const intlSupps = await prisma.attributeSupplement.createMany({
			data: intlRecords.attributeSupplement,
			skipDuplicates: true,
		})
		log(`Created ${intlSupps.count} attribute supplement records`)
		const intlSvcArea = await prisma.serviceArea.createMany({
			data: intlRecords.serviceArea,
			skipDuplicates: true,
		})
		log(`Created ${intlSvcArea.count} service area records`)
		const intlSvcAreaCountry = await prisma.serviceAreaCountry.createMany({
			data: intlRecords.serviceAreaCountry,
			skipDuplicates: true,
		})
		log(`Created ${intlSvcAreaCountry.count} service area country records`)
		const intlServiceTag = await prisma.orgServiceTag.createMany({
			data: intlRecords.orgServiceTag,
			skipDuplicates: true,
		})
		log(`Created ${intlServiceTag.count} service tag records`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob

interface IntlRecords {
	translationKey: Prisma.TranslationKeyCreateManyInput[]
	freeText: Prisma.FreeTextCreateManyInput[]
	organization: Prisma.OrganizationCreateManyInput[]
	orgService: Prisma.OrgServiceCreateManyInput[]
	attributeSupplement: Prisma.AttributeSupplementCreateManyInput[]
	serviceAccessAttribute: Prisma.ServiceAccessAttributeCreateManyInput[]
	serviceArea: Prisma.ServiceAreaCreateManyInput[]
	serviceAreaCountry: Prisma.ServiceAreaCountryCreateManyInput[]
	organizationAttribute: Prisma.OrganizationAttributeCreateManyInput[]
	orgServiceTag: Prisma.OrgServiceTagCreateManyInput[]
}
