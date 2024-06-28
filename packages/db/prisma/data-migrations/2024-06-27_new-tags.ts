import { Prisma } from '~db/client'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-06-27_new-tags',
	title: 'new tags',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240627_new_tags = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (ctx, task) => {
		const { createLogger, downloadFromDatastore, generateId, formatMessage, jobPostRunner, prisma } = ctx
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

		const leaderBadges = [
			{
				id: 'attr_01J1DF9MFN8QWFXKYR7XFJANSF',
				tag: 'lgbtq-led',
				name: 'LGBTQ+ Led',
				active: false,
				categories: { create: { categoryId: 'attc_01GW2HHFVMNHV2ZS5875JWCRJ7' } },
				canAttachTo: ['ORGANIZATION'],
				key: {
					create: {
						key: 'orgleader.lgbtq-led',
						text: 'LGBTQ+ Led',
						ns: 'attribute',
					},
				},
			},
		] satisfies Prisma.AttributeCreateInput[]
		const serviceCategories = [
			{
				id: 'svct_01J1DGAQK79BW8G73FA3RNXX3Q',
				category: 'Financial Assistance',
				active: false,
				key: {
					create: { key: 'financial-assistance.CATEGORYNAME', text: 'Financial Assistance', ns: 'services' },
				},
			},
		] satisfies Prisma.ServiceCategoryCreateInput[]
		const deleteTags = [
			{
				// Existing Food assistance tag. Primary food tag will be taking its place
				where: { id: 'svtg_01GW2HHFBPV0NV6R04MR84X9H6' },
			},
		] satisfies Prisma.ServiceTagDeleteArgs[]
		const deleteTagTranslations = [
			{ where: { ns_key: { ns: 'services', key: 'food.food-assistance' } } },
		] satisfies Prisma.TranslationKeyDeleteArgs[]
		const newServiceTags = [
			// Entertainment & Activities
			{
				name: 'Camps and excursions',
				primaryCategory: { connect: { id: 'svct_01GW2HHEVPE008PHCPNHZDAWMS' } },
				categories: { create: { categoryId: 'svct_01GW2HHEVPE008PHCPNHZDAWMS' } },
				key: {
					create: {
						key: 'sports-and-entertainment.camps-and-excursions',
						text: 'Camps and excursions',
						ns: 'services',
					},
				},
				active: false,
			},
			// Financial Assistance
			{
				name: 'Bail Funds',
				primaryCategory: { connect: { id: 'svct_01J1DGAQK79BW8G73FA3RNXX3Q' } },
				categories: { create: { categoryId: 'svct_01J1DGAQK79BW8G73FA3RNXX3Q' } },
				key: {
					create: {
						key: 'financial-assistance.bail-funds',
						text: 'Bail Funds',
						ns: 'services',
					},
				},
				active: false,
			},
			{
				name: 'Housing and utilities',
				primaryCategory: { connect: { id: 'svct_01J1DGAQK79BW8G73FA3RNXX3Q' } },
				categories: { create: { categoryId: 'svct_01J1DGAQK79BW8G73FA3RNXX3Q' } },
				key: {
					create: {
						key: 'financial-assistance.housing-and-utilities',
						text: 'Housing and utilities',
						ns: 'services',
					},
				},
				active: false,
			},
			{
				name: 'Legal fees',
				primaryCategory: { connect: { id: 'svct_01J1DGAQK79BW8G73FA3RNXX3Q' } },
				categories: { create: { categoryId: 'svct_01J1DGAQK79BW8G73FA3RNXX3Q' } },
				key: {
					create: {
						key: 'financial-assistance.legal-fees',
						text: 'Legal fees',
						ns: 'services',
					},
				},
				active: false,
			},
			{
				name: 'Healthcare and insurance',
				primaryCategory: { connect: { id: 'svct_01J1DGAQK79BW8G73FA3RNXX3Q' } },
				categories: { create: { categoryId: 'svct_01J1DGAQK79BW8G73FA3RNXX3Q' } },
				key: {
					create: {
						key: 'financial-assistance.healthcare-and-insurance',
						text: 'Healthcare and insurance',
						ns: 'services',
					},
				},
				active: false,
			},
			{
				name: 'Moving and domestic relocation',
				primaryCategory: { connect: { id: 'svct_01J1DGAQK79BW8G73FA3RNXX3Q' } },
				categories: { create: { categoryId: 'svct_01J1DGAQK79BW8G73FA3RNXX3Q' } },
				key: {
					create: {
						key: 'financial-assistance.moving-and-domestic-relocation',
						text: 'Moving and domestic relocation',
						ns: 'services',
					},
				},
				active: false,
			},
			{
				name: 'Mutual Aid',
				primaryCategory: { connect: { id: 'svct_01J1DGAQK79BW8G73FA3RNXX3Q' } },
				categories: { create: { categoryId: 'svct_01J1DGAQK79BW8G73FA3RNXX3Q' } },
				key: {
					create: {
						key: 'financial-assistance.mutual-aid',
						text: 'Mutual Aid',
						ns: 'services',
					},
				},
				active: false,
			},
			// Food
			{
				name: 'Community meals',
				primaryCategory: { connect: { id: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV' } },
				categories: { create: { categoryId: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV' } },
				key: {
					create: {
						key: 'food.community-meals',
						text: 'Community meals',
						ns: 'services',
					},
				},
				active: false,
			},
			{
				name: 'Food delivery',
				primaryCategory: { connect: { id: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV' } },
				categories: { create: { categoryId: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV' } },
				key: {
					create: {
						key: 'food.food-delivery',
						text: 'Food delivery',
						ns: 'services',
					},
				},
				active: false,
			},
			{
				name: 'Food pantries',
				primaryCategory: { connect: { id: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV' } },
				categories: { create: { categoryId: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV' } },
				key: {
					create: {
						key: 'food.food-pantries',
						text: 'Food pantries',
						ns: 'services',
					},
				},
				active: false,
			},
			{
				name: 'Nutrition education',
				primaryCategory: { connect: { id: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV' } },
				categories: {
					createMany: {
						data: [
							{ categoryId: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV' },
							// Medical
							{ categoryId: 'svct_01GW2HHEVKVHTWSBY7PVWC5390' },
						],
					},
				},
				key: {
					create: {
						key: 'food.nutrition-education',
						text: 'Nutrition education',
						ns: 'services',
					},
				},
				active: false,
			},
			// Housing
			{
				name: 'Drop-in centers',
				primaryCategory: { connect: { id: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV' } },
				categories: { create: { categoryId: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV' } },
				key: {
					create: {
						key: 'housing.drop-in-centers',
						text: 'Drop-in centers',
						ns: 'services',
					},
				},
				active: false,
			},
			// Legal
			{
				name: 'Family law',
				primaryCategory: { connect: { id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX' } },
				categories: { create: { categoryId: 'svct_01GW2HHEVH75KPRYKD49EJHYXX' } },
				key: {
					create: {
						key: 'legal.family-law',
						text: 'Family law',
						ns: 'services',
					},
				},
				active: false,
			},
			// Medical
			{
				name: 'Fertility and family planning services',
				primaryCategory: { connect: { id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390' } },
				categories: { create: { categoryId: 'svct_01GW2HHEVKVHTWSBY7PVWC5390' } },
				key: {
					create: {
						key: 'medical.fertility-and-family-planning-services',
						text: 'Fertility and family planning services',
						ns: 'services',
					},
				},
				active: false,
			},
			{
				name: 'Substance use',
				primaryCategory: { connect: { id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390' } },
				categories: { create: { categoryId: 'svct_01GW2HHEVKVHTWSBY7PVWC5390' } },
				key: {
					create: {
						key: 'medical.substance-use',
						text: 'Substance use',
						ns: 'services',
					},
				},
				active: false,
			},
			// Mental health
			{
				name: 'Family support groups',
				primaryCategory: { connect: { id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ' } },
				categories: { create: { categoryId: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ' } },
				key: {
					create: {
						key: 'mental-health.family-support-groups',
						text: 'Family support groups',
						ns: 'services',
					},
				},
				active: false,
			},
		] satisfies Prisma.ServiceTagCreateInput[]
		const addServiceToCategories = [
			// Scholarships => Financial assistance
			{ serviceTagId: 'svtg_01GW2HHFBPBQ7XNCBG5AJF6W0X', categoryId: 'svct_01J1DGAQK79BW8G73FA3RNXX3Q' },
			// Transit passes and discounts => Financial assistance
			{ serviceTagId: 'svtg_01GW2HHFBTM1JSTAQKF8DYS9V5', categoryId: 'svct_01J1DGAQK79BW8G73FA3RNXX3Q' },
			// Abortion Providers => Medical
			{ serviceTagId: 'svtg_01GW2HHFBN31248B3MH1486GE9', categoryId: 'svct_01GW2HHEVKVHTWSBY7PVWC5390' },
			// Trans health - horomonte & surgery letters => Mental health
			{ serviceTagId: 'svtg_01GW2HHFBSBVW6KJACB43FTFNQ', categoryId: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ' },
		] satisfies Prisma.ServiceTagToCategoryCreateManyInput[]
		const updateTags = [
			// Rename 'Leadership and professional development'
			{
				where: { id: 'svtg_01GW2HHFBP9GBJPZMWM9PA5DX0' },
				data: {
					name: 'Training and professional development',
					key: {
						update: {
							text: 'Training and professional development',
							key: 'education-and-employment.training-and-professional-development',
						},
					},
				},
			},
			// Rename 'Food'
			{
				where: { id: 'svtg_01GW2HHFBP9CP8V4WGA1QCWVKQ' },
				data: {
					name: 'Food assistance',
					key: {
						update: {
							text: 'Food assistance',
							key: 'food.food-assistance',
						},
					},
				},
			},
			// Move Mail service to Housing category
			{
				where: { id: 'svtg_01GW2HHFBT91CV2R6WKEX6MYPE' },
				data: {
					categories: {
						create: { categoryId: 'svct_01GW2HHEVF8W7D67CH3NVSQYA6' },
						delete: {
							categoryId_serviceTagId: {
								categoryId: 'svct_01GW2HHEVQ0VE6E94T3CZWEW9F',
								serviceTagId: 'svtg_01GW2HHFBT91CV2R6WKEX6MYPE',
							},
						},
					},
					primaryCategory: { connect: { id: 'svct_01GW2HHEVF8W7D67CH3NVSQYA6' } },
					name: 'Mail services',
					key: {
						update: {
							key: 'housing.mail-services',
							text: 'Mail services',
						},
					},
				},
			},
			// Rename Family petitions
			{
				where: { id: 'svtg_01GW2HHFBQF6937029TNRN458W' },
				data: {
					name: 'Family-based immigration',
					key: {
						update: {
							key: 'legal.family-based-immigration',
							text: 'Family-based immigration',
						},
					},
				},
			},
		] satisfies Prisma.ServiceTagUpdateArgs[]
		const updateServiceCategory = [
			// Deactivate Mail category.
			{
				where: { id: 'svct_01GW2HHEVQ0VE6E94T3CZWEW9F' },
				data: { active: false },
			},
		] satisfies Prisma.ServiceCategoryUpdateArgs[]

		await prisma.$transaction(async (tx) => {
			for (const data of leaderBadges) {
				log(`Creating badge ${data.name}`)
				const newBadge = await tx.attribute.create({ data })
				log(`Created badge ${newBadge.name} (${newBadge.id})`)
			}
			for (const data of serviceCategories) {
				log(`Creating category ${data.category}`)
				const newCategory = await tx.serviceCategory.create({ data })
				log(`Created category ${newCategory.category} (${newCategory.id})`)
			}
			for (const args of deleteTags) {
				log(`Deleting tag ${args.where.id}`)
				const deletedTag = await tx.serviceTag.delete(args)
				log(`Deleted tag ${deletedTag.name} (${deletedTag.id})`)
			}
			for (const args of deleteTagTranslations) {
				log(`Deleting tag translation ${args.where.ns_key.key}`)
				const deletedTagTranslation = await tx.translationKey.delete(args)
				log(`Deleted tag translation ${deletedTagTranslation.key}`)
			}
			for (const data of newServiceTags) {
				log(`Creating tag ${data.name}`)
				const newTag = await tx.serviceTag.create({ data })
				log(`Created tag ${newTag.name} (${newTag.id})`)
			}
			const linkedServiceCategories = await tx.serviceTagToCategory.createMany({
				data: addServiceToCategories,
				skipDuplicates: true,
			})
			log(`Linked service categories (${linkedServiceCategories.count})`)
			for (const args of updateTags) {
				log(`Updating tag ${args.where.id}`)
				const validatedArgs = Prisma.validator<Prisma.ServiceTagUpdateArgs>()(args)
				const updatedTag = await tx.serviceTag.update(validatedArgs)
				log(`Updated tag ${updatedTag.name} (${updatedTag.id})`)
			}
			for (const args of updateServiceCategory) {
				log(`Updating category ${args.where.id}`)
				const updatedCategory = await tx.serviceCategory.update(args)
				log(`Updated category ${updatedCategory.category} (${updatedCategory.id})`)
			}
		})

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
