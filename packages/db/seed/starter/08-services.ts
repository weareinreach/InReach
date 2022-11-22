import slugify from 'slugify'

import { prisma } from '~/index'
import { createMeta, namespaces, serviceData } from '~/seed/data/'
import { ListrTask } from '~/seed/starterData'

export const seedServices = async (task: ListrTask) => {
	try {
		const { id: namespaceId } = await prisma.translationNamespace.upsert({
			where: {
				name: namespaces.services,
			},
			create: {
				name: namespaces.services,
				...createMeta,
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
			const { id: categoryId } = await prisma.serviceCategory.upsert({
				where: {
					category,
				},
				create: {
					category,
					translationKey: {
						create: {
							key: slugify(category),
							text: category,
							namespaceId,
						},
					},
					...createMeta,
				},
				update: {},
				select: {
					id: true,
				},
			})

			if (services.length) {
				const serviceTransactions = await prisma.$transaction(
					services.map((record) =>
						prisma.serviceTag.upsert({
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
								translationKey: {
									create: {
										key: slugify(record),
										text: record,
										namespace: {
											connect: {
												id: namespaceId,
											},
										},
										...createMeta,
									},
								},
								...createMeta,
							},
							update: {},
							select: { id: true },
						})
					)
				)
				y = y + serviceTransactions.length
			}
			logMessage = `Upserted Category: ${category} with ${services.length} services`
			task.output = logMessage

			x++
		}
		logMessage = `Service Categories added: ${x} Service Records added: ${y}`
		task.output = logMessage
		task.title = `Service Categories & Tags (${x} categories, ${y} services)`
	} catch (err) {
		throw err
	}
}
