import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma, Prisma, generateId } from '~db/index'
import { batchRunner } from '~db/prisma/batchRunner'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { jobPreRunner, type JobDef } from '~db/prisma/jobPreRun'
import { namespaces } from '~db/seed/data'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-04-10-orgPhone-description',
	title: 'Move descriptions from PhoneType to FreeText',
	createdBy: 'Joe Karow',
}
const DataSchema = z
	.object({
		phones: z.array(
			z.object({
				phone: z.object({
					id: z.string(),
					phoneType: z.object({
						key: z.object({
							text: z.string(),
						}),
					}),
					updatedAt: z.coerce.date(),
					createdAt: z.coerce.date(),
				}),
			})
		),
		slug: z.string(),
	})
	.array()

const job: ListrTask = async (_ctx, task) => {
	/** Do not edit this part - this ensures that jobs are only run once */
	const runJob = await jobPreRunner(jobDef)
	if (!runJob) {
		return task.skip(`${jobDef.jobId} - Migration has already been run.`)
	}
	/** Start defining your data migration from here. */
	const data = DataSchema.parse(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data.json'), 'utf-8')))
	// Do stuff
	const translationRecord: Prisma.TranslationKeyCreateManyInput[] = []
	const freeTextRecord: Prisma.FreeTextCreateManyInput[] = []
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const phoneUpdateRecord: Prisma.PrismaPromise<any>[] = []

	for (const item of data) {
		const { slug, phones } = item

		for (const phone of phones) {
			const { createdAt, updatedAt } = phone.phone

			const key = `${slug}.${phone.phone.id}.description`
			const ns = namespaces.orgData
			const freeTextId = generateId('freeText', createdAt)
			translationRecord.push({ key, ns, text: phone.phone.phoneType.key.text, createdAt, updatedAt })
			freeTextRecord.push({ id: freeTextId, createdAt, updatedAt, key, ns })
			phoneUpdateRecord.push(
				prisma.orgPhone.update({
					where: { id: phone.phone.id },
					data: { description: { connect: { key_ns: { key, ns } } }, phoneType: { disconnect: true } },
				})
			)
		}
	}

	const translations = await prisma.translationKey.createMany({
		data: translationRecord,
		skipDuplicates: true,
	})
	task.output = `TranslationKey records: ${translations.count}`
	const freeText = await prisma.freeText.createMany({ data: freeTextRecord, skipDuplicates: true })
	task.output = `FreeText records: ${freeText.count}`
	task.output = `Running batch updates`
	const orgPhone = await batchRunner(phoneUpdateRecord, task)
	task.output = `OrgPhone records updated: ${orgPhone}`
	task.output = `Cleaning up PhoneType records`
	const phoneType = await prisma.phoneType.deleteMany()
	task.output = `PhoneType records deleted: ${phoneType.count}`
	const phoneTypeKeys = await prisma.translationKey.deleteMany({ where: { ns: namespaces.phoneType } })
	task.output = `TranslationKey records deleted: ${phoneTypeKeys.count}`
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
export const job20230410 = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: job,
} satisfies ListrJob
