import { prisma, Prisma } from '~db/index'
import { slug } from '~db/lib/slugGen'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { jobPreRunner, type JobDef } from '~db/prisma/jobPreRun'
import { namespaces } from '~db/seed/data/00-namespaces'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-04-11-phoneTypes',
	title: 'Add basic phone number types',
	createdBy: 'Joe Karow',
}

const job: ListrTask = async (_ctx, task) => {
	/** Do not edit this part - this ensures that jobs are only run once */
	const runJob = await jobPreRunner(jobDef)
	if (!runJob) {
		return task.skip(`${jobDef.jobId} - Migration has already been run.`)
	}
	/** Start defining your data migration from here. */
	const itemsToAdd = ['Office', 'Hotline', 'Fax', 'SMS', 'WhatsApp']
	const translations: Prisma.TranslationKeyCreateManyInput[] = []
	const phoneTypes: Prisma.PhoneTypeCreateManyInput[] = []

	for (const item of itemsToAdd) {
		const itemSlug = slug(item)
		translations.push({ key: itemSlug, ns: namespaces.phoneType, text: item })
		phoneTypes.push({ tsKey: itemSlug, tsNs: namespaces.phoneType, type: item })
	}

	const translationsAdded = await prisma.translationKey.createMany({
		data: translations,
		skipDuplicates: true,
	})
	task.output = `Translation keys added: ${translationsAdded.count}`

	const phoneTypesAdded = await prisma.phoneType.createMany({ data: phoneTypes, skipDuplicates: true })
	task.output = `PhoneTypes added: ${phoneTypesAdded.count}`
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
export const job20230411 = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: job,
} satisfies ListrJob
