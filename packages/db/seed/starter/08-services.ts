import { prisma } from '~/index'
import { keySlug, namespaces, serviceData } from '~/seed/data/'
import { logFile } from '~/seed/logger'
import { ListrTask } from '~/seed/starterData'

export const seedServices = async (task: ListrTask) => {
	try {
		await prisma.translationNamespace.upsert({
			where: {
				name: namespaces.services,
			},
			create: {
				name: namespaces.services,
			},
			update: {},
			select: {
				id: true,
			},
		})

		let x = 0
		let y = 0
		let logMessage = ''

		for (const [category, services] of serviceData) {
			logMessage = `(${x + 1}/${serviceData.length}) Upserting Service Category: ${category}`
			logFile.log(logMessage)
			task.output = logMessage
			const { id: categoryId } = await prisma.serviceCategory.upsert({
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
				},
			})

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
