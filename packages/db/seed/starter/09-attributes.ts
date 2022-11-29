import { Attribute } from '@prisma/client'
import slugify from 'slugify'

import { Prisma, prisma } from '~/index'
import { attributeData, createMeta } from '~/seed/data/'
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
					tag: slugify(category.name),
					description: category.description,
					namespace: category.namespace
						? {
								create: {
									name: category.namespace,
									...createMeta,
								},
						  }
						: undefined,
					...createMeta,
				},
				update: {
					description: category.description,
					tag: slugify(category.name),
					namespace: category.namespace
						? {
								connectOrCreate: {
									where: {
										name: category.namespace,
									},
									create: {
										name: category.namespace,
										...createMeta,
									},
								},
						  }
						: undefined,
					updatedBy: createMeta.updatedBy,
				},
				select: {
					id: true,
				},
			})
			x++
			const bulkTransactions: Prisma.Prisma__AttributeClient<Attribute>[] = []
			for (const record of category.attributes) {
				let idx = 0
				const { name, description, requireCountry, key, requireLanguage, requireSupplemental } = record
				logMessage = `  [${idx + 1}/${category.attributes.length}] Upserting Attribute: ${name}`
				logFile.log(logMessage)
				task.output = logMessage
				y++
				idx++
				const transaction = prisma.attribute.upsert({
					where: {
						categoryId_name: {
							categoryId,
							name,
						},
					},
					create: {
						name,
						tag: slugify(name),
						description,
						requireSupplemental,
						requireCountry,
						requireLanguage,
						category: {
							connect: {
								id: categoryId,
							},
						},
						key: {
							create: key
								? {
										key,
										text: name,
										namespace: {
											connect: {
												name: category.namespace,
											},
										},
										...createMeta,
								  }
								: undefined,
						},
						...createMeta,
					},
					update: {
						tag: slugify(name),
						description,
						requireCountry,
						requireLanguage,
						requireSupplemental,
						key: key
							? {
									update: {
										text: name,
									},
							  }
							: undefined,
					},
				})
				bulkTransactions.push(transaction)
			}

			await prisma.$transaction(bulkTransactions)

			logMessage = `(${x + 1}/${attributeData.length}) Upserted Category: ${category.name} with ${
				bulkTransactions.length
			} attributes`
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
