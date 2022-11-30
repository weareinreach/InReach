import { prisma } from '~/index'
import { namespaces, navigation } from '~/seed/data'
import { ListrTask } from '~/seed/starterData'

import { logFile } from '../logger'

export const seedNavigation = async (task: ListrTask) => {
	try {
		await prisma.translationNamespace.upsert({
			where: {
				name: namespaces.nav,
			},
			create: {
				name: namespaces.nav,
			},
			update: {},
			select: {
				id: true,
			},
		})

		const transactions = navigation.map((item) =>
			prisma.navigation.upsert({
				where: {
					display_href: {
						display: item.display,
						href: item.href,
					},
				},
				create: {
					display: item.display,
					href: item.href,
					key: {
						connectOrCreate: {
							where: {
								ns_key: {
									ns: namespaces.nav,
									key: item.key,
								},
							},
							create: {
								key: item.key,
								text: item.display,
								namespace: {
									connect: {
										name: namespaces.nav,
									},
								},
							},
						},
					},
				},
				update: {},
			})
		)

		const result = await prisma.$transaction(transactions)
		const logMessage = `Navigation records added: ${result.length}`
		logFile.log(logMessage)
		task.output = logMessage
		task.title = `Navigation Bar Links (${result.length} records)`
	} catch (err) {
		throw err
	}
}
