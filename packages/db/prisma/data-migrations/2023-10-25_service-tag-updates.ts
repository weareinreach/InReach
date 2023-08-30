import { prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-10-25-service-tag-updates',
	title: 'Service tag updates',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/** Job export - this variable MUST be UNIQUE */
export const job20231025_service_tag_updates = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (_ctx, task) => {
		/** Create logging instance */
		createLogger(task, jobDef.jobId)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))

		const serviceIds = [
			'osvc_01H299KDN183ERJXT7N7G83X0B',
			'osvc_01GVH3VJY77PZ38ETAWSSDE1SK',
			'osvc_01GVH3VEQP9JY09G9G3N1F86R2',
			'osvc_01GVH3VEQRVDDFT4VRFH2QG3S4',
			'osvc_01GVXWZRRV9ED8X28MT603XG50',
			'osvc_01GVH3VKT3YXZJ5XKPV1TS8KDE',
			'osvc_01GVH3VMWWSJXCBDQNPBF036PQ',
			'osvc_01GVXWZXS7X0P34PXPRTMRRA2T',
			'osvc_01GVH3VSG9KCZWAGKJH5DWDHPM',
			'osvc_01GVH3W3AEXTWZBAY84PHAKJ67',
			'osvc_01GVH3W4Q9T3CVMG95XW1GQWM6',
			'osvc_01GVH3W6R5NC92FZR485G8RJ8A',
			'osvc_01GVH3W8A9Y2A5W1Q1T170X63B',
			'osvc_01GVH3WJPN6M8C0PZZT1YZ09AS',
			'osvc_01GVH3WM7XAH99KQBPBAQCV709',
			'osvc_01GVXX0X1YGV24VF2FJ42YFWQY',
			'osvc_01GVXX0X4V6NGW9A37Z26CZSDR',
			'osvc_01H299KE22PHPR7QMYPSX7BW4B',
			'osvc_01H299KE5K36FW8NBMB1BWPWKG',
			'osvc_01H56ER2WWHGN0K063WSBM754P',
			'osvc_01H56ER3XHNSPFDKA5SSC2F0AJ',
			'osvc_01H299KDEMCB11DMVEDSDPVQP1',
			'osvc_01H299KDEZSWYEFM123347RXCN',
			'osvc_01H299KDJ9TCMS7WWZVQYBBK9Z',
			'osvc_01H299KEMN1E3A9KEXJJPGQJBR',
			'osvc_01H299KER1K6YXMFR52KSA4SS6',
			'osvc_01H299KETW67JQF07A4V734PAX',
			'osvc_01GVH3VEWHDC6F5FCQHB0H5GD6',
		]

		const transYouth = 'svtg_01HAD647BVMT10DWEXFG1EFM9J'

		const addedTags = await prisma.orgServiceTag.createMany({
			data: serviceIds.map((serviceId) => ({ serviceId, tagId: transYouth, active: true })),
			skipDuplicates: true,
		})
		log(`Added service tag to ${addedTags.count} services`)

		const activateTYHC = await prisma.serviceTag.update({
			where: { id: 'svtg_01HAD647BVMT10DWEXFG1EFM9J' },
			data: { active: true },
		})
		log(`Activated service tag -> ${activateTYHC.name}`)

		const incarReEntry = await prisma.serviceTag.update({
			where: {
				id: 'svtg_01H273CH9YC9PXQWJ5RV349T2F',
			},
			data: {
				name: 'Incarceration and re-entry services',
				key: { update: { text: 'Incarceration and re-entry services' } },
			},
		})
		log(`Updated service tag ${incarReEntry.id} to ${incarReEntry.name}`)
		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
