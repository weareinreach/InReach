import { logFile } from '../logger'

import { Prisma } from '~/client'
import { prisma } from '~/index'
import { namespaces, navigation } from '~/seed/data'
import { Log, iconList } from '~/seed/lib'
import { ListrTask } from '~/seed/starterData'

export const seedNavigation = async (task: ListrTask) => {
	try {
		const log: Log = (message, icon?, indent = false) => {
			const dispIcon = icon ? `${iconList(icon)} ` : ''
			const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
			logFile.info(formattedMessage)
			task.output = formattedMessage
		}
		const data: Prisma.NavigationCreateManyInput[] = []
		const translate: Prisma.TranslationKeyCreateManyInput[] = []

		for (const item of navigation) {
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
		const result = await prisma.navigation.createMany({ data, skipDuplicates: true })

		log(`Navigation records added: ${result.count}`, 'create')
		log(`Translation keys added: ${translationResult.count}`, 'tlate')
		task.title = `Navigation Bar Links (${result.count} records, ${translationResult.count} translation keys)`
	} catch (err) {
		throw err
	}
}
