import { prisma, Prisma, generateId, slug } from '~db/index'
import { attributeData, namespaces, supplementDataSchemas } from '~db/seed/data/'
import { Log, iconList } from '~db/seed/lib'
import { logFile } from '~db/seed/logger'
import { ListrTask } from '~db/seed/starterData'

type Data = {
	category: Prisma.AttributeCategoryCreateManyInput[]
	translate: Prisma.TranslationKeyCreateManyInput[]
	attribute: Prisma.AttributeCreateManyInput[]
	link: Prisma.AttributeToCategoryCreateManyInput[]
}
export const seedAttributes = async (task: ListrTask, attribData?: typeof attributeData) => {
	const log: Log = (message, icon?, indent = false) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		logFile.info(formattedMessage)
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

	const dataToMap = attribData ?? attributeData

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
