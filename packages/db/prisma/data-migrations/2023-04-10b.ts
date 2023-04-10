import { prisma, Prisma } from '~db/index'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { jobPreRunner, type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-04-10-SocialMediaService-updates',
	title: 'Add "social." prefix to i18n keys, update icons, add TikTok & GitHub',
	createdBy: 'Joe Karow',
}

const job: ListrTask = async (_ctx, task) => {
	/** Do not edit this part - this ensures that jobs are only run once */
	const runJob = await jobPreRunner(jobDef)
	if (!runJob) {
		return task.skip(`${jobDef.jobId} - Migration has already been run.`)
	}
	/** Start defining your data migration from here. */

	const socialMediaKeys = ['email', 'facebook', 'instagram', 'linkedin', 'twitter', 'youtube']

	const socialMediaUpdate = await prisma.$transaction(
		socialMediaKeys.map((key) =>
			prisma.translationKey.updateMany({
				where: { key },
				data: { key: `social.${key}` },
			})
		)
	)
	task.output = `SocialMediaService keys updated: ${socialMediaUpdate.length}`
	const upsertServices: Prisma.SocialMediaServiceUpsertArgs[] = [
		{
			where: { name: 'GitHub' },
			create: {
				name: 'GitHub',
				logoIcon: 'carbon:logo-github',
				key: {
					connectOrCreate: {
						where: { ns_key: { ns: 'common', key: 'social.github' } },
						create: { key: 'social.github', text: 'GitHub', ns: 'common' },
					},
				},
				urlBase: { set: ['https://www.github.com'] },
			},
			update: {},
		},
		{
			where: { name: 'TikTok' },
			create: {
				name: 'TikTok',
				logoIcon: 'simple-icons:tiktok',
				key: {
					connectOrCreate: {
						where: { ns_key: { ns: 'common', key: 'social.tiktok' } },
						create: { key: 'social.tiktok', text: 'TikTok', ns: 'common' },
					},
				},
				urlBase: { set: ['https://www.tiktok.com'] },
			},
			update: {},
		},
	]
	const servicesUpserted = await prisma.$transaction(
		upsertServices.map((args) => prisma.socialMediaService.upsert(args))
	)
	task.output = `SocialMediaService upserted: ${servicesUpserted.length}`
	const updateIcons: Prisma.SocialMediaServiceUpdateManyArgs[] = [
		{
			where: { name: 'Facebook' },
			data: { logoIcon: 'carbon:logo-facebook' },
		},
		{
			where: { name: 'Instagram' },
			data: { logoIcon: 'carbon:logo-instagram' },
		},
		{
			where: { name: 'Email' },
			data: { logoIcon: 'carbon:email' },
		},
		{
			where: { name: 'Twitter' },
			data: { logoIcon: 'carbon:logo-twitter' },
		},
		{
			where: { name: 'LinkedIn' },
			data: { logoIcon: 'carbon:logo-linkedin' },
		},
		{
			where: { name: 'YouTube' },
			data: { logoIcon: 'carbon:logo-youtube' },
		},
	]
	const iconsUpdated = await prisma.$transaction(
		updateIcons.map((args) => prisma.socialMediaService.updateMany(args))
	)
	task.output = `SocialMediaService icons updated: ${iconsUpdated.length}`
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
export const job20230410b = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: job,
} satisfies ListrJob
