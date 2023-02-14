import cuid from 'cuid'

import { Prisma } from '~db/client'
import { prisma } from '~db/index'
import { keySlug, namespaces, socialMediaLinks } from '~db/seed/data'
import { Log, iconList } from '~db/seed/lib'
import { logFile } from '~db/seed/logger'
import { ListrTask } from '~db/seed/starterData'

export const seedSocialMediaLinks = async (task: ListrTask) => {
	try {
		const log: Log = (message, icon?, indent = false) => {
			const dispIcon = icon ? `${iconList(icon)} ` : ''
			const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
			logFile.info(formattedMessage)
			task.output = formattedMessage
		}
		const services = await prisma.socialMediaService.findMany({ select: { id: true, tsKey: true } })
		const serviceMap = new Map<string, string>(services.map(({ id, tsKey }) => [tsKey, id]))

		const translate: Prisma.TranslationKeyCreateManyInput[] = []
		const serviceData: Prisma.SocialMediaServiceCreateManyInput[] = []
		const linkData: Prisma.SocialMediaLinkCreateManyInput[] = []
		const i = 0
		const total = socialMediaLinks.length
		for (const item of socialMediaLinks) {
			const key = keySlug(item.key)
			const urlBase = [...item.href]
			const serviceId = serviceMap.get(key) ?? cuid()
			const href = item.href[0]
			log(`[${i + 1}/${total}] Generate records for ${item.name}`, 'generate')

			if (!serviceMap.has(key)) {
				translate.push({
					key,
					ns: namespaces.socialMedia,
					text: item.name,
				})
				log(`[${item.name}] Generated translation key`, 'tlate', true)

				serviceData.push({
					id: serviceId,
					name: item.name,
					logoIcon: item.iconCode,
					urlBase,
					tsKey: key,
					tsNs: namespaces.socialMedia,
					internal: item.internal,
				})
				serviceMap.set(serviceId, key)
				log(`[${item.name}] Generated service definition`, 'generate', true)
			} else {
				log(`[${item.name}] SKIP Service definition: record exists`, 'skip', true)
			}

			linkData.push({
				icon: item.iconCode,
				href,
				serviceId,
			})
			log(`[${item.name}] Generated service hyperlink record`, 'generate', true)
		}

		const translationResult = await prisma.translationKey.createMany({
			data: translate,
			skipDuplicates: true,
		})
		const serviceResult = await prisma.socialMediaService.createMany({
			data: serviceData,
			skipDuplicates: true,
		})
		const result = await prisma.socialMediaLink.createMany({
			data: linkData,
			skipDuplicates: true,
		})

		log(`Social Media Service records added: ${serviceResult.count}`, 'create')
		log(`Translation keys added: ${translationResult.count}`, 'tlate')
		log(`Social Media Link records added: ${result.count}`, 'create')

		task.title = `Social Media Links (${result.count} records, ${translationResult.count} translation keys, ${serviceResult.count} services)`
	} catch (err) {
		throw err
	}
}
