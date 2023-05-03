import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma } from '~db/index'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPreRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-04-05-duplicateSites',
	title: 'Scrub duplicate website records with different lang code',
	createdBy: 'Joe Karow',
}

const DataSchema = z
	.object({
		id: z.string(),
		websites: z.array(
			z.object({
				id: z.string(),
				url: z.string(),
				languages: z.array(
					z.object({
						language: z.object({
							localeCode: z.string(),
						}),
					})
				),
			})
		),
	})
	.array()

const job: ListrTask = async (_ctx, task) => {
	/** Do not edit this part - this ensures that jobs are only run once */
	const runJob = await jobPreRunner(jobDef)
	if (!runJob) {
		return task.skip(`${jobDef.jobId} - Migration has already been run.`)
	}
	/** Start defining your data migration from here. */
	const rawData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data.json'), 'utf-8'))
	const parsed = DataSchema.parse(rawData)

	const idsToDelete: string[] = []
	for (const { websites } of parsed) {
		const siteToRemove = websites.find(({ languages }) =>
			languages.some(({ language }) => typeof language.localeCode === 'string')
		)?.id
		if (siteToRemove) idsToDelete.push(siteToRemove)
	}

	const records = await prisma.orgWebsite.updateMany({
		where: { id: { in: idsToDelete } },
		data: {
			published: false,
			deleted: true,
		},
	})

	task.output = `Records soft deleted: ${records.count}`
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
export const job20230405b = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: job,
} satisfies ListrJob
