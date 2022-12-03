import { prisma } from '~/index'
import { namespaces } from '~/seed/data/namespaces'
import { navigation } from '~/seed/data/navigation'
import { createMeta } from '~/seed/data/user'
import { ListrTask } from '~/seed/starter'

export const seedNavigation = async (task: ListrTask) => {
	try {
		const { id: namespaceId } = await prisma.translationNamespace.upsert({
			where: {
				name: namespaces.nav,
			},
			create: {
				name: namespaces.nav,
				...createMeta,
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
					translationKey: {
						connectOrCreate: {
							where: {
								key_namespaceId: {
									key: item.key,
									namespaceId,
								},
							},
							create: {
								key: item.key,
								text: item.display,
								namespace: {
									connect: {
										id: namespaceId,
									},
								},
								...createMeta,
							},
						},
					},
					...createMeta,
				},
				update: {},
			})
		)

		const result = await prisma.$transaction(transactions)
		const logMessage = `Navigation records added: ${result.length}`
		task.output = logMessage
		task.title = `Navigation Bar Links (${result.length} records)`
	} catch (err) {
		throw err
	}
}
