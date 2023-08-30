/* eslint-disable deprecation/deprecation */
import { namespace as namespaces } from '~db/generated/namespaces'
import { generateId, type Prisma, prisma, slug } from '~db/index'
import { iconList, type Log } from '~db/lib/icons'
import { type ListrTask, type MigrationJob, type PassedTask } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'
/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-04-11-permissions-attributes',
	title: 'Create additional permission & attribute records',
	createdBy: 'Joe Karow',
}
const supplementDataSchemas: Prisma.AttributeSupplementDataSchemaCreateManyInput[] = [
	{
		name: 'Number Range',
		tag: 'num-min-max',
		definition: {
			min: 'number',
			max: 'number',
		},
	},
	{
		name: 'Minimum',
		tag: 'num-min',
		definition: {
			min: 'number',
		},
	},
	{
		name: 'Maximum',
		tag: 'num-max',
		definition: {
			max: 'number',
		},
	},
	{
		name: 'Currency',
		tag: 'currency',
		definition: {
			amount: 'number',
			currency: 'string',
		},
	},
	{
		name: 'Incompatible Information',
		tag: 'incompatible',
		definition: 'any',
	},
]
const seedAttributes = async (task: PassedTask, attribData?: AttributeData) => {
	const log: Log = (message, icon?, indent = false) => {
		// createLogger(task, jobDef.jobId)
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		task.output = formattedMessage
	}
	const existingCategories = await prisma.attributeCategory.findMany({
		select: {
			id: true,
			tag: true,
		},
	})
	const categoryMap = new Map<string, string>(existingCategories.map(({ tag, id }) => [tag, id]))

	const existingAttributes = await prisma.attribute.findMany({ select: { id: true, name: true } })
	const attributeMap = new Map<string, string>(existingAttributes.map(({ name, id }) => [name, id]))

	let x = 0
	const data: Data = {
		category: [],
		translate: [],
		attribute: [],
		link: [],
	}
	const ns = namespaces.attribute

	const dataToMap = attribData
	if (!dataToMap) throw new Error('Missing attribute data')
	for (const category of dataToMap) {
		log(`(${x + 1}/${dataToMap.length}) Prepare Attribute Category: ${category.name}`, 'generate')

		const catTag = slug(category.name)
		const catKey = `${slug(category.ns)}.CATEGORYNAME`
		const categoryId = categoryMap.get(catTag) ?? generateId('attributeCategory')

		if (!categoryMap.has(catTag)) {
			data.translate.push({
				key: catKey,
				ns,
				text: category.name,
			})
			log(`[${catTag}] Generated translation key`, 'tlate', true)

			data.category.push({
				id: categoryId,
				name: category.name,
				tag: catTag,
				ns,
				intDesc: category.description,
			})
			log(`[${catTag}] Generated service definition`, 'generate', true)
			categoryMap.set(catTag, categoryId)
		} else {
			log(`[${catTag}] SKIP Attribute category: record exists`, 'skip', true)
		}
		x++
		let idx = 0
		for (const record of category.attributes) {
			const {
				name,
				description: intDesc,
				requireGeo,
				key: keyTag,
				requireLanguage,
				requireData,
				requireText,
				filterType,
				icon,
				iconBg,
			} = record
			log(`[${idx + 1}/${category.attributes.length}] Prepare Attribute: ${name}`, 'generate', true)

			idx++
			const key = `${slug(category.ns)}.${slug(keyTag)}`
			const attributeId = attributeMap.get(name) ?? generateId('attribute')

			if (!attributeMap.has(name)) {
				data.translate.push({
					key,
					ns,
					text: name,
				})
				log(`[${key}] Generated translation key`, 'tlate', true)
				const tag = slug(keyTag)

				data.attribute.push({
					id: attributeId,
					name,
					tag,
					intDesc,
					requireData,
					requireGeo,
					requireLanguage,
					requireText,
					tsKey: key,
					tsNs: ns,
					filterType,
					icon,
					iconBg,
				})

				log(`[${tag}] Generated attribute definition`, 'generate', true)

				data.link.push({
					attributeId,
					categoryId,
				})
				log(`[${tag}] Generated attribute to category link`, 'link', true)
				attributeMap.set(name, attributeId)
			} else {
				log(`[${key}] SKIP attribute definition: record exists`, 'skip', true)
			}
		}
	}
	const translateResult = await prisma.translationKey.createMany({
		data: data.translate,
		skipDuplicates: true,
	})
	const categoryResult = await prisma.attributeCategory.createMany({
		data: data.category,
		skipDuplicates: true,
	})
	const attributeResult = await prisma.attribute.createMany({
		data: data.attribute,
		skipDuplicates: true,
	})
	const linkResult = await prisma.attributeToCategory.createMany({
		data: data.link,
		skipDuplicates: true,
	})
	const schemaResult = await prisma.attributeSupplementDataSchema.createMany({
		data: supplementDataSchemas,
		skipDuplicates: true,
	})

	log(`Attribute category records added: ${categoryResult.count}`, 'create')
	log(`Attribute records added: ${attributeResult.count}`, 'create')
	log(`Attribute supplement data schema records added: ${schemaResult.count}`, 'create')
	log(`Translation keys added: ${translateResult.count}`, 'create')
	log(`Attribute to Category links added: ${linkResult.count}`, 'create')
	task.title = `Attribute Categories & Tags (${categoryResult.count} categories, ${attributeResult.count} attributes, ${translateResult.count} translation keys, ${linkResult.count} links)`
}

const job: ListrTask = async (_ctx, task) => {
	/** Do not edit this part - this ensures that jobs are only run once */
	if (await jobPreRunner(jobDef, task)) {
		return task.skip(`${jobDef.jobId} - Migration has already been run.`)
	}
	const attributesToAdd: AttributeData = [
		{
			name: 'Alerts',
			description: 'Alert messages',
			ns: 'alerts',
			attributes: [
				{
					key: 'info',
					name: 'Informational Alert',
					icon: 'carbon:information-filled',
					requireText: true,
				},
				{
					key: 'warn',
					name: 'Warning Alert',
					icon: 'carbon:warning-filled',
					requireText: true,
				},
			],
		},
	]

	const rolesToAdd: Prisma.PermissionCreateManyInput[] = [
		{
			name: 'alertOrg',
			description: 'Manage organization alerts.',
		},
		{
			name: 'alertLoc',
			description: 'Manage location alerts.',
		},
		{
			name: 'alertService',
			description: 'Manage service alerts.',
		},
		{
			name: 'internalNotesRead',
			description: 'View internal notes',
		},
		{
			name: 'internalNotesWrite',
			description: 'Edit internal notes',
		},
	]

	await seedAttributes(task, attributesToAdd)

	const permissionCreate = await prisma.permission.createMany({ data: rolesToAdd, skipDuplicates: true })
	task.output = `Permissions created: ${permissionCreate.count}`
	const userRoleCreate = await prisma.userRole.createMany({
		data: [{ name: 'Superuser', tag: 'root' }],
		skipDuplicates: true,
	})
	task.output = `User roles created: ${userRoleCreate.count}`
	/**
	 * DO NOT REMOVE BELOW - This writes a record to the DB to register that this migration has run
	 * successfully.
	 */
	await jobPostRunner(jobDef)
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
export const job20230411b = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: job,
	def: jobDef,
} satisfies MigrationJob

type AttributeItem = Omit<Prisma.AttributeCreateManyInput, 'tsKey' | 'tsNs' | 'tag'> & {
	// name: string
	description?: string
	key: string
	icon?: string
	iconBg?: string
	// requireLanguage?: boolean
	// requireGeo?: boolean
	// requireData?: boolean
	// requireText?: boolean
}
type AttributeCategory = Omit<Prisma.AttributeCategoryCreateManyInput, 'tag'> & {
	// name: string
	description?: string
	// ns: string
	attributes: AttributeItem[]
}
type AttributeData = AttributeCategory[]
type Data = {
	category: Prisma.AttributeCategoryCreateManyInput[]
	translate: Prisma.TranslationKeyCreateManyInput[]
	attribute: Prisma.AttributeCreateManyInput[]
	link: Prisma.AttributeToCategoryCreateManyInput[]
}
