import { prisma } from '~/index'
import { namespaces, socialMediaLinks } from '~/seed/data'
import { logFile } from '~/seed/logger'
import { ListrTask } from '~/seed/starterData'

export const seedSocialMediaLinks = async (task: ListrTask) => {
	try {
		const { id: namespaceId } = await prisma.translationNamespace.upsert({
			where: {
				name: namespaces.socialMedia,
			},
			create: {
				name: namespaces.socialMedia,
			},
			update: {},
			select: {
				id: true,
			},
		})

		const transactions = socialMediaLinks.map((item) =>
			prisma.socialMediaLink.upsert({
				where: {
					href: item.href,
				},
				create: {
					service: {
						connectOrCreate: {
							where: {
								name: item.key,
							},
							create: {
								name: item.key,
								logoIcon: item.iconCode,
								urlBase: '',
								key: {
									create: {
										key: item.key,
										text: item.key,
										namespace: {
											connect: {
												id: namespaceId,
											},
										},
									},
								},
							},
						},
					},
					href: item.href,
					icon: item.iconCode,
				},
				update: {},
			})
		)

		const result = await prisma.$transaction(transactions)
		const logMessage = `Social Media Link records added: ${result.length}`
		logFile.log(logMessage)
		task.output = logMessage
		task.title = `Social Media Links (${result.length} records)`
	} catch (err) {
		throw err
	}
}
