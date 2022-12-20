import { Attribute } from '@prisma/client'
import slugify from 'slugify'

import { Prisma } from '~/client'
import { prisma } from '~/index'
import { attributeData, namespaces } from '~/seed/data/'
import { logFile } from '~/seed/logger'
import { ListrTask } from '~/seed/starterData'

export const seedAttributes = async (task: ListrTask) => {
	try {
		let x = 0
		let y = 0
		let logMessage = ''
		for (const category of attributeData) {
			logMessage = `(${x + 1}/${attributeData.length}) Upserting Attribute Category: ${category.name}`
			logFile.log(logMessage)
			task.output = logMessage
			const { id: categoryId } = await prisma.attributeCategory.upsert({
				where: {
					name: category.name,
				},
				create: {
					name: category.name,
					tag: slugify(category.name, { lower: true }),
					intDesc: category.description,
					namespace: {
						connect: {
							name: namespaces.attribute,
						},
					},
				},
				update: {
					intDesc: category.description,
					tag: slugify(category.name, { lower: true }),
					namespace: {
						connect: {
							name: namespaces.attribute,
						},
					},
				},
				select: {
					id: true,
				},
			})
			x++
			const bulkTransactions: Prisma.Prisma__AttributeClient<Attribute>[] = []
			let idx = 0
			for (const record of category.attributes) {
				const {
					name,
					description: intDesc,
					requireCountry,
					key: keyTag,
					requireLanguage,
					requireData,
				} = record
				logMessage = `  [${idx + 1}/${category.attributes.length}] Upserting Attribute: ${name}`
				logFile.log(logMessage)
				task.output = logMessage
				const key = slugify(`${category.namespace}-${keyTag}`, { lower: true })
				y++
				idx++
				const transaction = prisma.attribute.upsert({
					where: {
						name,
					},
					create: {
						name,
						tag: slugify(keyTag, { lower: true }),
						intDesc,
						requireData,
						requireCountry,
						requireLanguage,
						category: {
							connect: {
								id: categoryId,
							},
						},
						key: {
							create: {
								key,
								text: name,
								namespace: {
									connect: {
										name: namespaces.attribute,
									},
								},
							},
						},
					},
					update: {
						tag: slugify(keyTag, { lower: true }),
						intDesc,
						requireCountry,
						requireLanguage,
						requireData,
						key: {
							update: {
								text: name,
							},
						},
					},
				})
				bulkTransactions.push(transaction)
			}

			await prisma.$transaction(bulkTransactions)

			logMessage = `(${x}/${attributeData.length}) Upserted Category: ${category.name} with ${bulkTransactions.length} attributes`
			logFile.log(logMessage)
			task.output = logMessage
		}
		logMessage = `Attribute Categories added: ${x} Attribute Records added: ${y}`
		logFile.log(logMessage)
		task.output = logMessage
		task.title = `Attribute Categories & Tags (${x} categories, ${y} attributes)`
	} catch (err) {
		throw err
	}
}
