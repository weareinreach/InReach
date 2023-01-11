import { Prisma } from '~/client'
import { prisma } from '~/index'
import { footerLinks, namespaces } from '~/seed/data'
import { Log, iconList } from '~/seed/lib'
import { logFile } from '~/seed/logger'
import { ListrTask } from '~/seed/starterData'

export const seedFooterLinks = async (task: ListrTask) => {
	try {
		const log: Log = (message, icon?, indent = false) => {
			const dispIcon = icon ? `${iconList(icon)} ` : ''
			const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
			logFile.info(formattedMessage)
			task.output = formattedMessage
		}

		const translate: Prisma.TranslationKeyCreateManyInput[] = []
		const data: Prisma.FooterLinkCreateManyInput[] = []

		for (const item of footerLinks) {
			translate.push({
				ns: namespaces.nav,
				key: item.key,
				text: item.display,
			})
			data.push({
				display: item.display,
				href: item.href,
				tsKey: item.key,
				tsNs: namespaces.nav,
			})
		}

		const translationResult = await prisma.translationKey.createMany({
			data: translate,
			skipDuplicates: true,
		})
		const result = await prisma.footerLink.createMany({ data, skipDuplicates: true })

		log(`Footer links added: ${result.count}`, 'create')
		log(`Translation keys added: ${translationResult.count}`, 'tlate')
		task.title = `${task.title} (${result.count} records, ${translationResult.count} translation keys)`
	} catch (err) {
		throw err
	}
}
