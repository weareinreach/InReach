import { prisma, Prisma, generateId, slug } from '~db/index'
import { namespaces, serviceData } from '~db/seed/data/'
import { Log, iconList } from '~db/seed/lib'
import { logFile } from '~db/seed/logger'
import { ListrTask } from '~db/seed/starterData'

type Data = {
	category: Prisma.ServiceCategoryCreateManyInput[]
	service: Prisma.ServiceTagCreateManyInput[]
	translation: Prisma.TranslationKeyCreateManyInput[]
}

export const seedServices = async (task: ListrTask) => {
	const log: Log = (message, icon?, indent = false) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		logFile.info(formattedMessage)
		task.output = formattedMessage
	}

	let x = 0
	const data: Data = {
		category: [],
		service: [],
		translation: [],
	}
	const existingCategories = await prisma.serviceCategory.findMany({
		select: {
			id: true,
			category: true,
		},
	})
	const categoryMap = new Map<string, string>(existingCategories.map(({ id, category }) => [category, id]))

	for (const [category, services] of serviceData) {
		log(`(${x + 1}/${serviceData.length}) Prepare Service Category record: ${category}`, 'generate')
		const categoryId = categoryMap.get(category) ?? generateId('serviceCategory')
		const ns = namespaces.services
		if (!categoryMap.has(category)) {
			const key = `${slug(category)}.CATEGORYNAME`
			data.translation.push({
				key,
				ns,
				text: category,
			})
			log(`[${category}] Generated translation key`, 'tlate', true)

			data.category.push({
				id: categoryId,
				tsKey: key,
				tsNs: ns,
				category,
			})
			categoryMap.set(category, categoryId)
			log(`[${category}] Generated service category definition`, 'generate', true)
		} else {
			log(`[${category}] SKIP Service category definition: record exists`, 'skip', true)
		}

		if (services.length) {
			let idx = 0
			for (const record of services) {
				log(`[${idx + 1}/${services.length}] Generating Service Tag: ${record}`, 'generate', true)
				const key = `${slug(category)}.${slug(record)}`
				const ns = namespaces.services
				data.translation.push({
					key,
					ns,
					text: record,
				})
				log(`[${record}] Generated translation key`, 'tlate', true)
				data.service.push({
					categoryId,
					name: record,
					tsKey: key,
					tsNs: ns,
				})
				log(`[${record}] Generated service tag definition`, 'generate', true)
				idx++
			}
		}
		x++
	}

	const translateResult = await prisma.translationKey.createMany({
		data: data.translation,
		skipDuplicates: true,
	})
	const categoryResult = await prisma.serviceCategory.createMany({
		data: data.category,
		skipDuplicates: true,
	})
	const tagResult = await prisma.serviceTag.createMany({ data: data.service, skipDuplicates: true })

	log(`Service category records added: ${categoryResult.count}`, 'create')
	log(`Service tag records added: ${tagResult.count}`, 'create')
	log(`Translation key records added: ${translateResult.count}`, 'create')
	task.title = `Service Categories & Tags (${categoryResult.count} categories, ${tagResult.count} services, ${translateResult.count} translation keys)`
}
