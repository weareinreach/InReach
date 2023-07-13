import { prisma } from '~db/index'
import { type ListrJob, type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-06-20_tags-for-suggestions',
	title: 'Update "activeForSuggest" flags',
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
export const job20230620 = {
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
		/**
		 * Start defining your data migration from here.
		 *
		 * To log output, use `task.output = 'Message to log'`
		 *
		 * This will be written to `stdout` and to a log file in `/prisma/migration-logs/`
		 */

		// Do stuff

		const attribUpdateTrue = await prisma.attribute.updateMany({
			where: {
				id: {
					in: [
						'attr_01GW2HHFVN72D7XEBZZJXCJQXQ',
						'attr_01GW2HHFVPTK9555WHJHDBDA2J',
						'attr_01GW2HHFVPCVX8F3B7M30ZJEHW',
						'attr_01GW2HHFVPJERY0GS9D7F56A23',
						'attr_01GW2HHFVPSYBCYF37B44WP6CZ',
						'attr_01GW2HHFVQVEGH6W3A2ANH1QZE',
						'attr_01GW2HHFVQCZPA3Z5GW6J3MQHW',
						'attr_01GW2HHFVQ8AGBKBBZJWTHNP2F',
						'attr_01GW2HHFVRMQFJ9AMA633SQQGV',
						'attr_01GW2HHFVQX4M8DY1FSAYSJSSK',
						'attr_01GW2HHFVQEFWW42MBAD64BWXZ',
						'attr_01GW2HHFVQ7SYGD3KM8WP9X50B',
					],
				},
			},
			data: { activeForSuggest: true },
		})
		const attribUpdateFalse = await prisma.attribute.updateMany({
			where: {
				id: {
					in: [
						'attr_01H273DMQ22TVP3RA36M1XWFBA',
						'attr_01H273FCJ8NNG1T1BV300CN702',
						'attr_01H273ETEX43K0BR6FG3G7MZ4S',
						'attr_01H273FPTCFKTVBNK158HE9M42',
						'attr_01H273G39A14TGHT4DA1T0DW5M',
					],
				},
			},
			data: { activeForSuggest: false },
		})
		task.output = `Update Attributes - True: ${attribUpdateTrue.count}, False: ${attribUpdateFalse.count}`

		const servCatUpdateTrue = await prisma.serviceCategory.updateMany({
			where: {
				id: {
					in: [
						'svct_01GW2HHEVBM0ZHVJ295P2QKR6H',
						'svct_01GW2HHEVCXGK9GPK6SAZ2Q7E3',
						'svct_01GW2HHEVDKRVB42KT85KA3FM3',
						'svct_01GW2HHEVDX898ZT0QGM471WMV',
						'svct_01GW2HHEVFXW9YFMK4R95ZHBPV',
						'svct_01GW2HHEVF8W7D67CH3NVSQYA6',
						'svct_01GW2HHEVGD7CE9VKYVSZYYTPS',
						'svct_01GW2HHEVH75KPRYKD49EJHYXX',
						'svct_01GW2HHEVKVHTWSBY7PVWC5390',
						'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ',
						'svct_01GW2HHEVPFRQR07PTHMWJDDKS',
						'svct_01GW2HHEVPXANJ6MPCDE0S4CWT',
						'svct_01GW2HHEVQ0VE6E94T3CZWEW9F',
						'svct_01GW2HHEVPE008PHCPNHZDAWMS',
					],
				},
			},
			data: { activeForSuggest: true },
		})

		task.output = `Service Categories - True: ${servCatUpdateTrue.count}, False: 0`

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
