import { Prisma } from '~db/client'
import { prisma } from '~db/index'
import { namespaces, userImmigrationData } from '~db/seed/data/'
import { Log, iconList } from '~db/seed/lib'
import { logFile } from '~db/seed/logger'
import { ListrTask } from '~db/seed/starterData'

type Data = {
	translate: Prisma.TranslationKeyCreateManyInput[]
	immigration: Prisma.UserImmigrationCreateManyInput[]
}

export const seedUserImmigration = async (task: ListrTask) => {
	const log: Log = (message, icon?, indent = false) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		logFile.info(formattedMessage)
		task.output = formattedMessage
	}
	const ns = namespaces.user

	try {
		let idx = 0
		const data: Data = {
			immigration: [],
			translate: [],
		}

		for (const record of userImmigrationData) {
			const count = idx + 1
			log(`(${count}/${userImmigrationData.length}) Prepare Immigration status record: ${record.text}`)
			data.translate.push({
				key: record.key,
				ns,
				text: record.text,
			})

			data.immigration.push({
				status: record.text,
				tsKey: record.key,
				tsNs: ns,
			})
			idx++
		}

		const translateResult = await prisma.translationKey.createMany({
			data: data.translate,
			skipDuplicates: true,
		})
		const result = await prisma.userImmigration.createMany({ data: data.immigration, skipDuplicates: true })
		log(`Immigration status records added: ${result.count}`, 'create')
		log(`Translation keys added: ${translateResult.count}`, 'create')

		task.title = `Immigration status (${result.count} records, ${translateResult.count} translation keys)`
	} catch (error) {
		throw error
	}
}
