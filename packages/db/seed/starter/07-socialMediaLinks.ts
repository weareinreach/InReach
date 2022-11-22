import { prisma } from '~/index'
import { namespaces } from '~/seed/data/namespaces'
import { socialMediaLinks } from '~/seed/data/socialMediaLink'
import { createMeta } from '~/seed/data/user'
import { ListrTask } from '~/seed/starter'

export const seedSocialMediaLinks = async (task: ListrTask) => {
	try {
		const { id: namespaceId } = await prisma.translationNamespace.upsert({
			where: {
				name: namespaces.socialMedia,
			},
			create: {
				name: namespaces.socialMedia,
				...createMeta,
			},
			update: {},
			select: {
				id: true,
			},
		})

		const transactions = socialMediaLinks.map((item) =>
			prisma.socialMediaLink.upsert({
				where: {
					service_href: {
						service: item.key,
						href: item.href,
					},
				},
				create: {
					service: item.key,
					href: item.href,
					icon: item.iconCode,
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
								text: item.key,
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
		const logMessage = `Social Media Link records added: ${result.length}`
		task.output = logMessage
		task.title = `Social Media Links (${result.length} records)`
	} catch (err) {
		throw err
	}
}
