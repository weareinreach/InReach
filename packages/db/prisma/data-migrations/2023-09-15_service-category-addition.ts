import { prisma } from '~db/client'
import { namespace } from '~db/generated/namespaces'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-09-15-service-category-addition',
	title: 'service category addition',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/** Job export - this variable MUST be UNIQUE */
export const job20230915_service_category_addition = {
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

		const transFocusedCategory = await prisma.serviceCategory.upsert({
			where: {
				category: 'Trans Focused Services',
			},
			update: {},
			create: {
				id: 'svct_01HAD5SFNG7R86J1RTHXBFD96J',
				category: 'Trans Focused Services',
				active: false,
				activeForSuggest: true,
				key: {
					connectOrCreate: {
						where: {
							ns_key: {
								ns: namespace.services,
								key: 'trans-focused-services.CATEGORYNAME',
							},
						},
						create: {
							key: 'trans-focused-services.CATEGORYNAME',
							text: 'Trans Focused Services',
							ns: namespace.services,
						},
					},
				},
			},
		})

		log(`New service category created: ${transFocusedCategory.category} (${transFocusedCategory.id})`)

		const updateNameGenderTag = await prisma.serviceTag.update({
			where: { id: 'svtg_01GW2HHFBRB8R4AQVR2FYE72EC' },
			data: {
				name: 'Name and gender marker change',
				key: { update: { text: 'Name and gender marker change' } },
			},
		})
		log(`Updated service tag: ${updateNameGenderTag.name} (${updateNameGenderTag.id})`)

		const transHealthYouthCare = await prisma.serviceTag.upsert({
			where: { id: 'svtg_01HAD647BVMT10DWEXFG1EFM9J' },
			update: {},
			create: {
				id: 'svtg_01HAD647BVMT10DWEXFG1EFM9J',
				name: 'Trans health - youth care',
				active: false,
				primaryCategory: { connect: { id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390' } },
				key: {
					connectOrCreate: {
						where: {
							ns_key: {
								ns: namespace.services,
								key: 'medical.trans-health-youth-care',
							},
						},
						create: {
							key: 'medical.trans-health-youth-care',
							text: 'Trans health - youth care',
							ns: namespace.services,
						},
					},
				},
				categories: {
					createMany: {
						data: [
							{ categoryId: 'svct_01GW2HHEVKVHTWSBY7PVWC5390', active: false },
							{ categoryId: transFocusedCategory.id, active: false },
						],
						skipDuplicates: true,
					},
				},
			},
		})
		log(`New service tag created: ${transHealthYouthCare.name} (${transHealthYouthCare.id})`)

		const transportGACare = await prisma.serviceTag.upsert({
			where: { id: 'svtg_01HAD99DSF7TH2HDXNYC331BVN' },
			update: {},
			create: {
				id: 'svtg_01HAD99DSF7TH2HDXNYC331BVN',
				name: 'Transportation for gender affirming care',
				active: false,
				primaryCategory: { connect: { id: transFocusedCategory.id } },
				key: {
					connectOrCreate: {
						where: {
							ns_key: {
								ns: namespace.services,
								key: 'trans-focused-services.transport-gacare',
							},
						},
						create: {
							key: 'trans-focused-services.transport-gacare',
							text: 'Transportation for gender affirming care',
							ns: namespace.services,
						},
					},
				},
				categories: {
					createMany: {
						data: [
							{ categoryId: transFocusedCategory.id, active: false },
							{ categoryId: 'svct_01GW2HHEVPXANJ6MPCDE0S4CWT', active: false },
						],
						skipDuplicates: true,
					},
				},
			},
		})
		log(`New service tag created: ${transportGACare.name} (${transportGACare.id})`)

		const transReloSupport = await prisma.serviceTag.upsert({
			where: { id: 'svtg_01HADA68N465FMV5P6XYD4VQBV' },
			update: {},
			create: {
				id: 'svtg_01HADA68N465FMV5P6XYD4VQBV',
				name: 'Trans relocation support',
				active: false,
				primaryCategory: { connect: { id: transFocusedCategory.id } },
				key: {
					connectOrCreate: {
						where: {
							ns_key: {
								ns: namespace.services,
								key: 'trans-focused-services.transport-relo-support',
							},
						},
						create: {
							key: 'trans-focused-services.transport-relo-support',
							text: 'Trans relocation support',
							ns: namespace.services,
						},
					},
				},
				categories: {
					createMany: {
						data: [
							{ categoryId: transFocusedCategory.id, active: false },
							{ categoryId: 'svct_01GW2HHEVPXANJ6MPCDE0S4CWT', active: false },
						],
						skipDuplicates: true,
					},
				},
			},
		})
		log(`New service tag created: ${transReloSupport.name} (${transReloSupport.id})`)

		const addToTFSCategory = await prisma.serviceTagToCategory.createMany({
			data: [
				// Trans housing
				{
					categoryId: transFocusedCategory.id,
					serviceTagId: 'svtg_01GW2HHFBQ02KJQ7E5NPM3ERNE',
					active: false,
				},
				// Gender-affirming items
				{
					categoryId: transFocusedCategory.id,
					serviceTagId: 'svtg_01GW2HHFBQ817GKC3K6D6JGMVC',
					active: false,
				},
				// Gender-neutral bathrooms
				{
					categoryId: transFocusedCategory.id,
					serviceTagId: 'svtg_01GW2HHFBQNARDK4H2W30GC1QR',
					active: false,
				},
				// Name and gender marker change
				{
					categoryId: transFocusedCategory.id,
					serviceTagId: 'svtg_01GW2HHFBRB8R4AQVR2FYE72EC',
					active: false,
				},
				// Trans health - gender affirming surgery
				{
					categoryId: transFocusedCategory.id,
					serviceTagId: 'svtg_01GW2HHFBR506BA0ZA7XZWX23Q',
					active: false,
				},
				// Trans health - hormone and surgery letters
				{
					categoryId: transFocusedCategory.id,
					serviceTagId: 'svtg_01GW2HHFBSBVW6KJACB43FTFNQ',
					active: false,
				},
				// Trans health - hormone therapy
				{
					categoryId: transFocusedCategory.id,
					serviceTagId: 'svtg_01GW2HHFBSZJ7ZQD3AVMKQK83N',
					active: false,
				},
				// Trans health - primary care
				{
					categoryId: transFocusedCategory.id,
					serviceTagId: 'svtg_01GW2HHFBSG3BES4BKSW269M8K',
					active: false,
				},
				// Trans health - speech therapy
				{
					categoryId: transFocusedCategory.id,
					serviceTagId: 'svtg_01GW2HHFBS5YQWBD8N2V56X5X0',
					active: false,
				},
				// Trans support groups
				{
					categoryId: transFocusedCategory.id,
					serviceTagId: 'svtg_01GW2HHFBSPTXA7Q4W5RKFP53W',
					active: false,
				},
				// Support for caregivers of trans youth
				{
					categoryId: transFocusedCategory.id,
					serviceTagId: 'svtg_01GW2HHFBS72MEA9GWN7FWYWQA',
					active: false,
				},
			],
			skipDuplicates: true,
		})
		log(`${addToTFSCategory.count} service tags added to Trans Focused Services category`)
		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
