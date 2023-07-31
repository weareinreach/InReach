import { prisma, type Prisma } from '~db/client'
import { namespace } from '~db/generated/namespaces'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'
import { JsonInputOrNullSuperJSON } from '~db/zod_util'

import { data } from './!data'

const accessTypeMap = {
	link: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
	phone: 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0',
	email: 'attr_01GW2HHFVKFM4TDY4QRK4AR2ZW',
	sms: 'attr_01H6PRPT32KX1JPGJSHAF2D89C',
	whatsapp: 'attr_01H6PRPTWRS80XFM77EMHKZ787',
} as const

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-07-31_national-crisis-resources',
	title: 'Add/update national crisis resources',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
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
export const job20230731b = {
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
		const newAttribKeys = await prisma.translationKey.createMany({
			data: [
				{
					key: 'serviceaccess.accesssms',
					ns: namespace.attribute,
					text: 'Access Instructions - SMS',
				},
				{
					key: 'serviceaccess.accesswhatsapp',
					ns: namespace.attribute,
					text: 'Access Instructions - WhatsApp',
				},
			],
			skipDuplicates: true,
		})

		const newAttribs = await prisma.attribute.createMany({
			data: [
				{
					id: accessTypeMap.sms,
					tag: 'accesssms',
					name: 'Access Instructions - SMS',
					tsKey: 'serviceaccess.accesssms',
					tsNs: namespace.attribute,
					active: true,
				},
				{
					id: accessTypeMap.whatsapp,
					tag: 'accesswhatsapp',
					name: 'Access Instructions - WhatsApp',
					tsKey: 'serviceaccess.accesswhatsapp',
					tsNs: namespace.attribute,
					active: true,
				},
			],
			skipDuplicates: true,
		})
		log(`New Attributes created: ${newAttribs.count} (Keys: ${newAttribKeys.count})`)

		const newOrg = await prisma.organization.createMany({
			data: [
				{
					id: 'orgn_01H6PFMSPGG8FAJC32D97PMHQE',
					name: 'LGBT National Hotline',
					slug: 'lgbt-national-hotline',
					crisisResource: true,
					sourceId: 'srce_01H3FR96DFKRAM07AZ8T8MXHE5',
					published: true,
				},
				{
					id: 'orgn_01H6PQ07W414JAWCEN619FQ77W',
					name: 'Kids Help Phone',
					slug: 'kids-help-phone',
					crisisResource: true,
					sourceId: 'srce_01H3FR96DFKRAM07AZ8T8MXHE5',
					published: true,
				},
			],
			skipDuplicates: true,
		})
		log(`New Organizations created: ${newOrg.count}`)

		const orgIds = [
			'orgn_01H29CX1TRDGZZ73ETGHRN910M', // 988 Suicide and Crisis Lifeline
			'orgn_01H6PFMSPGG8FAJC32D97PMHQE', // LGBT National Hotline
			'orgn_01GVH3VAZZ9QX30X2MYM5R71SH', // BlackLine
			'orgn_01GVH3V4BHVEYSTF9AY2RYCMP5', // Trans Lifeline
			'orgn_01GVH3V3SYFJEYC2Y8QZ28V9FQ', // The Trevor Project
			'orgn_01GVXXKS098AD03KRV5MRVNAAS', // SAGE
			'orgn_01H6PQ07W414JAWCEN619FQ77W', // Kids Help Phone
		]
		const orgSort = await prisma.$transaction(
			orgIds.map((id, i) =>
				prisma.organization.update({ where: { id }, data: { crisisResourceSort: i + 1001 } })
			)
		)
		log(`Updated ${orgSort.length} organization crisis resource sort order keys.`)

		const records: Records = {
			translationKey: [],
			freeText: [],
			organization: [],
			orgService: [],
			serviceAccessAttribute: [],
			serviceAttribute: [],
			attributeSupplement: [],
			serviceArea: [],
			serviceAreaCountry: [],
			orgServiceTag: [],
		}

		for (const item of data) {
			records.translationKey.push({
				key: `${item.orgId}.${item.svcId}.description`,
				ns: namespace.orgData,
				text: item.description,
			})
			records.freeText.push({
				id: item.ftDescId,
				key: `${item.orgId}.${item.svcId}.description`,
				ns: namespace.orgData,
			})
			records.orgService.push({
				id: item.svcId,
				descriptionId: item.ftDescId,
				crisisSupportOnly: true,
				organizationId: item.orgId,
				published: true,
			})
			records.serviceAttribute.push({
				orgServiceId: item.svcId,
				attributeId: item.communityTagId,
				active: true,
			})
			records.serviceArea.push({
				active: true,
				id: item.servAreaId,
				orgServiceId: item.svcId,
			})
			for (const countryId of item.countries) {
				records.serviceAreaCountry.push({ countryId, serviceAreaId: item.servAreaId, active: true })
			}
			for (const access of item.svcAcc) {
				records.translationKey.push({
					key: `${item.orgId}.attribute.${access.id}`,
					ns: namespace.orgData,
					text: access.description,
				})
				records.freeText.push({
					id: access.descriptionId,
					key: `${item.orgId}.attribute.${access.id}`,
					ns: namespace.orgData,
				})
				records.serviceAccessAttribute.push({
					attributeId: accessTypeMap[access.access_type],
					serviceId: item.svcId,
					active: true,
				})

				records.attributeSupplement.push({
					id: access.id,
					active: true,
					textId: access.descriptionId,
					data: JsonInputOrNullSuperJSON.parse({
						access_type: access.access_type,
						access_value: access.access_value,
						...(access.sms_body ? { sms_body: access.sms_body } : {}),
					}),
					serviceAccessAttributeAttributeId: accessTypeMap[access.access_type],
					serviceAccessAttributeServiceId: item.svcId,
				})
			}
			records.orgServiceTag.push({
				serviceId: item.svcId,
				tagId: 'svtg_01H6PAQDGBNFT1G78M9T4MVR4G',
				active: true,
			})
		}

		const TKey = await prisma.translationKey.createMany({
			data: records.translationKey,
			skipDuplicates: true,
		})
		log(`Created ${TKey.count} translation keys`)
		const FText = await prisma.freeText.createMany({
			data: records.freeText,
			skipDuplicates: true,
		})
		log(`Created ${FText.count} freetext records`)
		const Orgs = await prisma.organization.createMany({
			data: records.organization,
			skipDuplicates: true,
		})
		log(`Created ${Orgs.count} organization records`)
		const Svc = await prisma.orgService.createMany({
			data: records.orgService,
			skipDuplicates: true,
		})
		log(`Created ${Svc.count} org service records`)
		const SvcAcc = await prisma.serviceAccessAttribute.createMany({
			data: records.serviceAccessAttribute,
			skipDuplicates: true,
		})
		log(`Created ${SvcAcc.count} service access attribute records`)
		const OrgAttr = await prisma.serviceAttribute.createMany({
			data: records.serviceAttribute,
			skipDuplicates: true,
		})
		log(`Created ${OrgAttr.count} organization attribute records`)
		const Supps = await prisma.attributeSupplement.createMany({
			data: records.attributeSupplement,
			skipDuplicates: true,
		})
		log(`Created ${Supps.count} attribute supplement records`)
		const SvcArea = await prisma.serviceArea.createMany({
			data: records.serviceArea,
			skipDuplicates: true,
		})
		log(`Created ${SvcArea.count} service area records`)
		const SvcAreaCountry = await prisma.serviceAreaCountry.createMany({
			data: records.serviceAreaCountry,
			skipDuplicates: true,
		})
		log(`Created ${SvcAreaCountry.count} service area country records`)
		const ServiceTag = await prisma.orgServiceTag.createMany({
			data: records.orgServiceTag,
			skipDuplicates: true,
		})
		log(`Created ${ServiceTag.count} service tag records`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob

interface Records {
	translationKey: Prisma.TranslationKeyCreateManyInput[]
	freeText: Prisma.FreeTextCreateManyInput[]
	organization: Prisma.OrganizationCreateManyInput[]
	orgService: Prisma.OrgServiceCreateManyInput[]
	attributeSupplement: Prisma.AttributeSupplementCreateManyInput[]
	serviceAccessAttribute: Prisma.ServiceAccessAttributeCreateManyInput[]
	serviceArea: Prisma.ServiceAreaCreateManyInput[]
	serviceAreaCountry: Prisma.ServiceAreaCountryCreateManyInput[]
	serviceAttribute: Prisma.ServiceAttributeCreateManyInput[]
	orgServiceTag: Prisma.OrgServiceTagCreateManyInput[]
}
