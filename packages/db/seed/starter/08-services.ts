import { prisma } from '~/index'
import { keySlug, namespaces, serviceData } from '~/seed/data/'
import { logFile } from '~/seed/logger'
import { ListrTask } from '~/seed/starterData'

export const seedServices = async (task: ListrTask) => {
	try {
		let x = 0
		let y = 0
		let logMessage = ''

		for (const [category, services] of serviceData) {
			logMessage = `(${x + 1}/${serviceData.length}) Upserting Service Category: ${category}`
			logFile.log(logMessage)
			task.output = logMessage
			const newCategory = await prisma.serviceCategory.upsert({
				where: {
					category,
				},
				create: {
					category,
					key: {
						create: {
							key: keySlug(category),
							text: category,
							namespace: {
								connect: {
									name: namespaces.services,
								},
							},
						},
					},
				},
				update: {},
				select: {
					id: true,
					key: {
						select: {
							key: true,
							ns: true,
						},
					},
				},
			})
			const { id: categoryId } = newCategory
			if (services.length) {
				const serviceTransactions = await prisma.$transaction(
					services.map((record, idx) => {
						logMessage = `\t[${idx + 1}/${services.length}] Upserting Service: ${record}`
						logFile.log(logMessage)
						task.output = logMessage
						return prisma.serviceTag.upsert({
							where: {
								name_categoryId: {
									categoryId,
									name: record,
								},
							},
							create: {
								name: record,
								category: {
									connect: {
										id: categoryId,
									},
								},
								key: {
									create: {
										key: keySlug(record),
										text: record,
										namespace: {
											connect: {
												name: namespaces.services,
											},
										},
									},
								},
							},
							update: {},
							select: { id: true },
						})
					})
				)
				y = y + serviceTransactions.length
			} else {
				await prisma.serviceTag.upsert({
					where: {
						name_categoryId: {
							name: category,
							categoryId,
						},
					},
					create: {
						name: category,
						category: {
							connect: {
								id: categoryId,
							},
						},
						key: {
							connect: {
								ns_key: {
									key: newCategory.key.key,
									ns: newCategory.key.ns,
								},
							},
						},
					},
					update: {},
				})
				y++
			}
			logMessage = `(${x + 1}/${serviceData.length}) Upserted Category: ${category} with ${
				services.length
			} services`
			logFile.log(logMessage)
			task.output = logMessage

			x++
		}
		logMessage = `Service Categories added: ${x} Service Records added: ${y}`
		logFile.log(logMessage)
		task.output = logMessage
		task.title = `Service Categories & Tags (${x} categories, ${y} services)`
	} catch (err) {
		throw err
	}
}
