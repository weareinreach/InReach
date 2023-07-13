import fs from 'fs'
import path from 'path'

import { prisma, type Prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'

import { OrgAttributesSchema, ServAttributesSchema, ServiceTagsSchema } from './!types'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-07-12_3-update-tags-attributes',
	title: 'Add tags & attributes',
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
export const job20230712c = {
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
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))
		/**
		 * Start defining your data migration from here.
		 *
		 * To log output, use `task.output = 'Message to log'`
		 *
		 * This will be written to `stdout` and to a log file in `/prisma/migration-logs/`
		 */
		const attributes = await prisma.attribute.findMany({
			select: { tag: true, id: true },
		})
		const serviceTags = await prisma.serviceTag.findMany({
			select: { tsKey: true, id: true },
		})
		const legacyOrgIds = await prisma.organization.findMany({ select: { id: true, legacyId: true } })
		const legacyServiceIds = await prisma.orgService.findMany({
			select: { id: true, legacyId: true },
		})

		const attributeMap = new Map(attributes.map(({ tag, id }) => [tag, id]))
		const serviceTagMap = new Map(serviceTags.map(({ tsKey, id }) => [tsKey, id]))
		const orgIdMap = new Map(legacyOrgIds.map(({ id, legacyId }) => [legacyId, id]))
		const serviceIdMap = new Map(legacyServiceIds.map(({ id, legacyId }) => [legacyId, id]))

		const orgAttributeData = OrgAttributesSchema.parse(
			JSON.parse(fs.readFileSync(path.resolve(__dirname, './orgAttributes.json'), 'utf-8'))
		)
		const servAttributeData = ServAttributesSchema.parse(
			JSON.parse(fs.readFileSync(path.resolve(__dirname, './servAttributes.json'), 'utf-8'))
		)
		const serviceTagData = ServiceTagsSchema.parse(
			JSON.parse(fs.readFileSync(path.resolve(__dirname, './serviceTags.json'), 'utf-8'))
		)

		const batch: Batches = {
			orgServiceTag: [],
			serviceAttribute: [],
			organizationAttribute: [],
		}
		const exceptions: Record<
			'orgServiceTag' | 'serviceAttribute' | 'organizationAttribute',
			Record<string, string>[]
		> = {
			orgServiceTag: [],
			serviceAttribute: [],
			organizationAttribute: [],
		}
		for (const [attribute, records] of Object.entries(orgAttributeData)) {
			const attributeId = attributeMap.get(attribute)
			if (!attributeId) throw new Error(`Cannot map attributeId for ${attribute}`)
			log(`Preparing Organization Attribute batch for ${attribute} (${records.length} items)`)
			for (const { legacyId } of records) {
				const organizationId = orgIdMap.get(legacyId)
				if (!organizationId) {
					exceptions.organizationAttribute.push({ attribute, legacyId })
					continue
				}
				batch.organizationAttribute.push({ attributeId, organizationId })
			}
		}
		for (const [attribute, records] of Object.entries(servAttributeData)) {
			const attributeId = attributeMap.get(attribute)
			if (!attributeId) throw new Error(`Cannot map attributeId for ${attribute}`)
			log(`Preparing Service Attribute batch for ${attribute} (${records.length} items)`)
			for (const { legacyId, legacyServiceId } of records) {
				const orgServiceId = serviceIdMap.get(legacyServiceId)
				if (!orgServiceId) {
					exceptions.serviceAttribute.push({ attribute, legacyId, legacyServiceId })
					continue
				}
				batch.serviceAttribute.push({ attributeId, orgServiceId })
			}
		}
		for (const [tag, records] of Object.entries(serviceTagData)) {
			const tagId = serviceTagMap.get(tag)
			if (!tagId) throw new Error(`Cannot map id for ${tag}`)
			log(`Preparing Service Tag batch for ${tag} (${records.length} items)`)
			for (const { legacyId, legacyServiceId } of records) {
				const serviceId = serviceIdMap.get(legacyServiceId)
				if (!serviceId) {
					exceptions.orgServiceTag.push({ tag, legacyId, legacyServiceId })
					continue
				}
				batch.orgServiceTag.push({ serviceId, tagId })
			}
		}

		const orgAttributeResult = await prisma.organizationAttribute.createMany({
			data: batch.organizationAttribute,
			skipDuplicates: true,
		})
		log(
			`Organization Attribute records successfully created: ${
				orgAttributeResult.count
			}. Skipped due to potential duplication: ${
				batch.organizationAttribute.length - orgAttributeResult.count
			}`
		)
		const servAttributeResult = await prisma.serviceAttribute.createMany({
			data: batch.serviceAttribute,
			skipDuplicates: true,
		})
		log(
			`Service Attribute records successfully created: ${
				servAttributeResult.count
			}. Skipped due to potential duplication: ${batch.serviceAttribute.length - servAttributeResult.count}`
		)
		const serviceTagResult = await prisma.orgServiceTag.createMany({
			data: batch.orgServiceTag,
			skipDuplicates: true,
		})
		log(
			`Service Tag records successfully created: ${
				serviceTagResult.count
			}. Skipped due to potential duplication: ${batch.orgServiceTag.length - serviceTagResult.count}`
		)
		if (
			exceptions.orgServiceTag.length ||
			exceptions.organizationAttribute.length ||
			exceptions.serviceAttribute.length
		) {
			const filename = path.resolve(__dirname, `./!exceptions.json`)
			fs.writeFileSync(filename, JSON.stringify(exceptions))
			log(
				`${
					exceptions.orgServiceTag.length +
					exceptions.organizationAttribute.length +
					exceptions.serviceAttribute.length
				} exceptions written to ${filename}`
			)
		}

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob

interface Batches {
	orgServiceTag: Prisma.OrgServiceTagCreateManyInput[]
	serviceAttribute: Prisma.ServiceAttributeCreateManyInput[]
	organizationAttribute: Prisma.OrganizationAttributeCreateManyInput[]
}
