import { prisma } from '~/index'
import { footerLinks, namespaces } from '~/seed/data'
import { logFile } from '~/seed/logger'
import { ListrTask } from '~/seed/starterData'

export const seedFooterLinks = async (task: ListrTask) => {
	try {
		const { id: namespaceId } = await prisma.translationNamespace.upsert({
			where: {
				name: namespaces.footer,
			},
			create: {
				name: namespaces.footer,
			},
			update: {},
			select: {
				id: true,
			},
		})

		const transactions = footerLinks.map((item) =>
			prisma.footerLink.upsert({
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
									key: item.key,
									ns: namespaces.footer,
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
							},
						},
					},
				},
				update: {},
			})
		)

		const result = await prisma.$transaction(transactions)
		const logMessage = `Footer Link records added: ${result.length}`
		logFile.log(logMessage)
		task.output = logMessage
		task.title = `Footer Links (${result.length} records)`
	} catch (err) {
		throw err
	}
}
