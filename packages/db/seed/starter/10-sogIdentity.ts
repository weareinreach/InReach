import { prisma, Prisma } from '~db/index'
import { namespaces, sogIdentityData } from '~db/seed/data/'
import { Log, iconList } from '~db/seed/lib'
import { logFile } from '~db/seed/logger'
import { ListrTask } from '~db/seed/starterData'

type Data = {
	translate: Prisma.TranslationKeyCreateManyInput[]
	sog: Prisma.UserSOGIdentityCreateManyInput[]
}

export const seedSOGIdentity = async (task: ListrTask) => {
	const log: Log = (message, icon?, indent = false) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		logFile.info(formattedMessage)
		task.output = formattedMessage
	}
	const ns = namespaces.user

	let idx = 0
	const data: Data = {
		sog: [],
		translate: [],
	}
	for (const record of sogIdentityData) {
		const count = idx + 1
		log(`(${count}/${sogIdentityData.length}) Prepare SOG/Identity record: ${record.text}`)
		data.translate.push({
			key: record.key,
			ns,
			text: record.text,
		})

		data.sog.push({
			identifyAs: record.text,
			tsKey: record.key,
			tsNs: ns,
		})
		idx++
	}

	const translateResult = await prisma.translationKey.createMany({
		data: data.translate,
		skipDuplicates: true,
	})
	const sogResult = await prisma.userSOGIdentity.createMany({ data: data.sog, skipDuplicates: true })
	log(`SOG/Identity records added: ${sogResult.count}`, 'create')
	log(`Translation keys added: ${translateResult.count}`, 'create')

	task.title = `SOG/Identity (${sogResult.count} records, ${translateResult.count} translation keys)`
}
