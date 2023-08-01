import { prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-07-31_crisis-support-tags',
	title: 'Add Crisis Support Tags & Category',
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
export const job20230731 = {
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

		const newCategory = await prisma.attributeCategory.create({
			data: {
				id: 'attc_01H6P8SSY4C141YH7BAC1RW7KJ',
				name: 'Crisis Support Community',
				tag: 'crisis-support-community',
				active: true,
				ns: 'attribute',
				renderVariant: 'COMMUNITY',
			},
		})
		log(`Attribute Category created: ${newCategory.name}`)

		const translationKeys = await prisma.translationKey.createMany({
			data: [
				{
					key: 'crisis-support-community.general-lgbtq',
					ns: 'attribute',
					text: 'General LGBTQ+',
				},
				{
					key: 'crisis-support-community.elders',
					ns: 'attribute',
					text: 'Elders',
				},
				{
					key: 'crisis-support.CATEGORYNAME',
					ns: 'services',
					text: 'Crisis Support',
				},
				{
					key: 'crisis-support.crisis-support',
					ns: 'services',
					text: 'Crisis Support',
				},
			],
			skipDuplicates: true,
		})
		log(`Translation Keys created: ${translationKeys.count}`)

		const newTags = await prisma.attribute.createMany({
			data: [
				{
					id: 'attr_01H6P8T277D0C8HFQA6N09FJWD',
					name: 'General LGBTQ+',
					tag: 'general-lgbtq',
					active: true,
					icon: '🏳️‍🌈',
					tsNs: 'attribute',
					tsKey: 'crisis-support-community.general-lgbtq',
				},
				{
					id: 'attr_01H6P951P0V3CR807P8KRH82S1',
					name: 'Elders',
					tag: 'elders',
					active: true,
					icon: '🌳',
					tsNs: 'attribute',
					tsKey: 'crisis-support-community.elders',
				},
			],
			skipDuplicates: true,
		})
		log(`Attributes created: ${newTags.count}`)

		const categoryLinks = await prisma.attributeToCategory.createMany({
			data: [
				{
					attributeId: 'attr_01H6P8T277D0C8HFQA6N09FJWD', // General LGBTQ+
					categoryId: 'attc_01H6P8SSY4C141YH7BAC1RW7KJ',
				},
				{
					attributeId: 'attr_01H6P951P0V3CR807P8KRH82S1', // Elders
					categoryId: 'attc_01H6P8SSY4C141YH7BAC1RW7KJ',
				},
				{
					attributeId: 'attr_01GW2HHFVN72D7XEBZZJXCJQXQ', // BIPOC
					categoryId: 'attc_01H6P8SSY4C141YH7BAC1RW7KJ',
				},
				{
					attributeId: 'attr_01GW2HHFVPSYBCYF37B44WP6CZ', // Trans
					categoryId: 'attc_01H6P8SSY4C141YH7BAC1RW7KJ',
				},
				{
					attributeId: 'attr_01GW2HHFVQCZPA3Z5GW6J3MQHW', // Youth
					categoryId: 'attc_01H6P8SSY4C141YH7BAC1RW7KJ',
				},
			],
			skipDuplicates: true,
		})
		log(`Attributes linked to Category: ${categoryLinks.count}`)

		const newServCategory = await prisma.serviceCategory.create({
			data: {
				id: 'svct_01H6P8M1YA3H7QX3CXN25Q9F00',
				category: 'Crisis Support',
				active: true,
				activeForSuggest: false,
				crisisSupportOnly: true,
				tsKey: 'crisis-support.CATEGORYNAME',
				tsNs: 'services',
			},
		})
		log(`Service Category created: ${newServCategory.category}`)
		const updateServCategory = await prisma.serviceCategory.update({
			where: { id: 'svct_01H64G5CDDYVMADBGTS0TPWF86' },
			data: { crisisSupportOnly: true },
		})
		log(`Service Category updated: ${updateServCategory.category}`)
		const newServTag = await prisma.serviceTag.create({
			data: {
				id: 'svtg_01H6PAQDGBNFT1G78M9T4MVR4G',
				name: 'Crisis Support',
				active: true,
				crisisSupportOnly: true,
				categoryId: 'svct_01H6P8M1YA3H7QX3CXN25Q9F00',
				tsKey: 'crisis-support.crisis-support',
				tsNs: 'services',
			},
		})
		log(`Service Tag created: ${newServTag.name}`)
		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
