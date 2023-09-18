import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma, type Prisma } from '~db/client'
import { namespace } from '~db/generated/namespaces'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-09-11-migrate-alert-messages',
	title: 'migrate alert messages',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}

const infoAlert = 'attr_01GYSVX1NAMR6RDV6M69H4KN3T'
const warnAlert = 'attr_01GYSVX1NAKP7C6JKJ342ZM35M'
const Schema = z
	.object({
		id: z.string(),
		freeTextId: z.string(),
		suppId: z.string(),
		en: z.string(),
		es: z.string().optional(),
	})
	.array()

/** Job export - this variable MUST be UNIQUE */
export const job20230911_migrate_alert_messages = {
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

		const data = Schema.parse(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data.json'), 'utf-8')))

		const translationKey: Prisma.TranslationKeyCreateManyInput[] = []
		const freeText: Prisma.FreeTextCreateManyInput[] = []
		const organizationAttribute: Prisma.OrganizationAttributeCreateManyInput[] = []
		const attributeSupplement: Prisma.AttributeSupplementCreateManyInput[] = []

		const translation: { key: string; text: string }[] = []

		const ns = namespace.orgData
		for (const record of data) {
			const key = `${record.id}.attribute.${record.suppId}`
			translationKey.push({ key, ns, text: record.en })
			freeText.push({ key, ns, id: record.freeTextId })
			organizationAttribute.push({ attributeId: infoAlert, organizationId: record.id, active: true })
			attributeSupplement.push({
				id: record.suppId,
				textId: record.freeTextId,
				organizationAttributeAttributeId: infoAlert,
				organizationAttributeOrganizationId: record.id,
			})

			if (record.es) {
				translation.push({ key, text: record.es })
			}
		}

		// fs.writeFileSync(path.resolve(__dirname, '___translations.json'), JSON.stringify(translation))

		await prisma.$transaction(
			async (tx) => {
				const tkeys = await tx.translationKey.createMany({ data: translationKey, skipDuplicates: true })
				log(`Translation keys created: ${tkeys.count}`)

				const fText = await tx.freeText.createMany({ data: freeText, skipDuplicates: true })
				log(`FreeText records created: ${fText.count}`)

				const oAtt = await tx.organizationAttribute.createMany({
					data: organizationAttribute,
					skipDuplicates: true,
				})
				log(`Organization Attribute records created: ${oAtt.count}`)

				const aSupp = await tx.attributeSupplement.createMany({
					data: attributeSupplement,
					skipDuplicates: true,
				})
				log(`Attribute Supplement records created: ${aSupp.count}`)
			},
			{ timeout: 60000 }
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
