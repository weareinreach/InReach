import { Prisma, PrismaPromise } from '@prisma/client'
import { writeFileSync } from 'fs'

import { prisma } from '~/index'
import { migrateLog } from '~/seed/logger'
import { Context, ListrTask } from '~/seed/migrate-v1'

import {
	attributeRecords,
	attributeSupplements,
	freeText,
	orgAPIConnections,
	orgConnections as orgConnectionRecords,
	orgEmails,
	orgHours,
	orgLocations,
	orgPhones,
	orgPhotos,
	orgServices,
	orgSocials,
	orgWebsites,
	rollback,
	serviceAccess as serviceAccessRecords,
	serviceAreaConnections,
	serviceAreas,
	serviceConnections,
	translationKeys,
} from './generator'

const recordCount = (count: number) => `${count} ${count === 1 ? 'record' : 'records'}`
const capFirst = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)

const handleError = (error: unknown, data: unknown) => {
	const detailedError = new Error('Caught error during transaction', { cause: { error, data } })
	migrateLog.error(JSON.stringify(detailedError))
	throw detailedError
}

const createManyRunner = async (
	task: ListrTask,
	prismaTransaction: PrismaPromise<Prisma.BatchPayload>,
	description: string,
	total: number
) => {
	const log = (message: string) => {
		migrateLog.info(message)
		task.output = message
	}
	try {
		log(`Inserting ${description} records`)
		const result = await prismaTransaction
		const statusIcon = () => {
			let icon = ''
			switch (true) {
				case total === 0 && result.count === 0: {
					icon = '❓'
					break
				}
				case total === result.count: {
					icon = '✅'
					break
				}
				case total && !result.count: {
					icon = '❌'
					break
				}
				case total !== result.count: {
					icon = '⚠️'
					break
				}
			}
			return icon
		}
		log(`💾 ${statusIcon()} ${capFirst(description)} - submitted: ${total}, generated: ${result.count}`)
		task.title = `${task.title} (${recordCount(result.count)})`
	} catch (error) {
		migrateLog.info('createManyRunner catch')
		migrateLog.error(error)
		throw `${error}`
	}
}

export const translations = async (task: ListrTask) => {
	const data = translationKeys
	try {
		await createManyRunner(
			task,
			prisma.translationKey.createMany({ data, skipDuplicates: true }),
			'translation key',
			data.length
		)
	} catch (error) {
		const detailedError = new Error('Error during createMany', { cause: { error, data } })
		migrateLog.error(detailedError)
		throw detailedError
	}
}

export const freetext = async (ctx: Context, task: ListrTask) => {
	const data = freeText
	try {
		await createManyRunner(
			task,
			prisma.freeText.createMany({ data, skipDuplicates: true }),
			'free text',
			data.length
		)
	} catch (error) {
		writeFileSync('./migrateError.json', JSON.stringify([error, data]))
		handleError(error, data)
	}
}

export const locations = async (task: ListrTask) => {
	const data = orgLocations
	try {
		await createManyRunner(
			task,
			prisma.orgLocation.createMany({ data, skipDuplicates: true }),
			'location',
			data.length
		)
	} catch (error) {
		handleError(error, data)
	}
}
export const phones = async (task: ListrTask) => {
	const data = orgPhones
	try {
		await createManyRunner(
			task,
			prisma.orgPhone.createMany({ data, skipDuplicates: true }),
			'phone',
			data.length
		)
	} catch (error) {
		handleError(error, data)
	}
}
export const emails = async (task: ListrTask) => {
	const data = orgEmails
	try {
		await createManyRunner(
			task,
			prisma.orgEmail.createMany({ data, skipDuplicates: true }),
			'email',
			data.length
		)
	} catch (error) {
		handleError(error, data)
	}
}
export const websites = async (task: ListrTask) => {
	const data = orgWebsites
	try {
		await createManyRunner(
			task,
			prisma.orgWebsite.createMany({ data, skipDuplicates: true }),
			'website',
			data.length
		)
	} catch (error) {
		handleError(error, data)
	}
}
export const socials = async (task: ListrTask) => {
	const data = orgSocials
	try {
		await createManyRunner(
			task,
			prisma.orgSocialMedia.createMany({ data, skipDuplicates: true }),
			'social media',
			data.length
		)
	} catch (error) {
		handleError(error, data)
	}
}
export const apiConnections = async (task: ListrTask) => {
	const data = orgAPIConnections
	try {
		await createManyRunner(
			task,
			prisma.outsideAPI.createMany({ data, skipDuplicates: true }),
			'outside API connection',
			data.length
		)
	} catch (error) {
		handleError(error, data)
	}
}
export const photos = async (task: ListrTask) => {
	const data = orgPhotos
	try {
		await createManyRunner(
			task,
			prisma.orgPhoto.createMany({ data, skipDuplicates: true }),
			'photo',
			data.length
		)
	} catch (error) {
		handleError(error, data)
	}
}
export const hours = async (task: ListrTask) => {
	const data = orgHours
	try {
		await createManyRunner(
			task,
			prisma.orgHours.createMany({ data, skipDuplicates: true }),
			'operating hours',
			data.length
		)
	} catch (error) {
		handleError(error, data)
	}
}
export const services = async (task: ListrTask) => {
	const data = orgServices
	try {
		await createManyRunner(
			task,
			prisma.orgService.createMany({ data, skipDuplicates: true }),
			'service',
			data.length
		)
	} catch (error) {
		handleError(error, data)
	}
}
export const serviceAccess = async (task: ListrTask) => {
	const data = serviceAccessRecords
	try {
		await createManyRunner(
			task,
			prisma.serviceAccess.createMany({ data, skipDuplicates: true }),
			'service access',
			data.length
		)
	} catch (error) {
		handleError(error, data)
	}
}
export const attributes = async (task: ListrTask) => {
	const data = attributeRecords
	const servaccess = await prisma.serviceAccess.findMany()
	writeFileSync(
		'./attrib.json',
		JSON.stringify([
			data.filter((x) => x.serviceAccessId),
			servaccess,
			data
				.map((x) => ({
					record: x,
					match: x.serviceAccessId ? servaccess.some((y) => y.id === x.serviceAccessId) : undefined,
				}))
				.filter((x) => x.match === false),
		])
	)
	try {
		await createManyRunner(
			task,
			prisma.attributeRecord.createMany({ data, skipDuplicates: true }),
			'attribute',
			data.length
		)
	} catch (error) {
		handleError(error, data)
	}
}
export const attributeSupplement = async (task: ListrTask) => {
	const data = attributeSupplements
	try {
		await createManyRunner(
			task,
			prisma.attributeSupplement.createMany({ data, skipDuplicates: true }),
			'attribute supplement',
			data.length
		)
	} catch (error) {
		handleError(error, data)
	}
}
export const servAreas = async (task: ListrTask) => {
	const data = serviceAreas
	try {
		await createManyRunner(
			task,
			prisma.serviceArea.createMany({ data, skipDuplicates: true }),
			'service area',
			data.length
		)
		const created = await prisma.serviceArea.findMany()
		writeFileSync('./servAreaCreated.json', JSON.stringify({ data, created }))
	} catch (error) {
		handleError(error, data)
	}
}

export const servAreaConnections = async (task: ListrTask) => {
	const description = 'service area'
	const log = (message: string) => {
		migrateLog.info(message)
		task.output = message
	}
	log(`Updating ${description} records`)
	writeFileSync('./servArea.json', JSON.stringify(serviceAreaConnections))
	let counter = 0
	const total = serviceAreaConnections.length
	for (const data of serviceAreaConnections) {
		const c = counter + 1
		log(`📤 Transaction ${c} of ${total}`)
		try {
			await prisma.serviceArea.update(data)
		} catch (error) {
			handleError(error, data)
		}
		counter++
	}
	log(`💾 ${description} processed: ${counter}`)
	task.title = `${task.title} (${recordCount(counter)})`
}
export const servConnections = async (task: ListrTask) => {
	const description = 'service links'
	const log = (message: string) => {
		migrateLog.info(message)
		task.output = message
	}
	log(`Updating ${description}`)
	let counter = 0
	const total = serviceConnections.length
	for (const data of serviceConnections) {
		const c = counter + 1
		log(`📤 Transaction ${c} of ${total}`)
		try {
			await prisma.orgService.update(data)
		} catch (error) {
			handleError(error, data)
		}
		counter++
	}
	log(`💾 ${description} processed: ${counter}`)
	task.title = `${task.title} (${recordCount(counter)})`
}

export const orgConnections = async (task: ListrTask) => {
	const description = 'organization links'
	const log = (message: string) => {
		migrateLog.info(message)
		task.output = message
	}
	log(`Updating ${description}`)
	let counter = 0
	const total = orgConnectionRecords.length
	for (const data of orgConnectionRecords) {
		const c = counter + 1
		log(`📤 Transaction ${c} of ${total}`)
		try {
			await prisma.organization.update(data)
		} catch (error) {
			handleError(error, data)
		}
		counter++
	}
	log(`💾 ${description} processed: ${counter}`)
	task.title = `${task.title} (${recordCount(counter)})`
}

const runRollback = async (task: ListrTask, prismaTransaction: PrismaPromise<Prisma.BatchPayload>) => {
	try {
		const result = await prismaTransaction
		task.title = `${task.title} (${result.count} deleted)`
		migrateLog.info(`🚮 ${task.title}`)
	} catch (error) {
		migrateLog.log('runRollback catch')
		migrateLog.error(error)
		throw error
	}
}

export const rollbackOrgs = async (task: ListrTask) => {
	const {
		orgDescTranslations,
		organizations,
		orgLocations,
		translationKeys,
		orgPhones,
		orgEmails,
		orgWebsites,
		orgSocials,
		orgAPIConnections,
		orgPhotos,
		orgHours,
		orgServices,
		serviceAccess,
		attributeRecords,
		attributeSupplements,
		serviceAreas,
	} = rollback
	const key = (records: string[]) => ({ where: { key: { in: records } } })
	const legacyId = (records: string[]) => ({ where: { legacyId: { in: records } } })
	const id = (records: string[]) => ({ where: { id: { in: records } } })
	const url = (records: string[]) => ({ where: { url: { in: records } } })
	const apiIdentifier = (records: string[]) => ({ where: { apiIdentifier: { in: records } } })
	const src = (records: string[]) => ({ where: { src: { in: records } } })

	task.title = 'Rolling back changes due to error'
	try {
		task.title = 'Rolling back service area records'
		await runRollback(task, prisma.serviceArea.deleteMany(id(serviceAreas)))
		task.title = 'Rolling back attribute supplement records'
		await runRollback(task, prisma.attributeSupplement.deleteMany(id(attributeSupplements)))
		task.title = 'Rolling back attribute records'
		await runRollback(task, prisma.attributeRecord.deleteMany(id(attributeRecords)))
		task.title = 'Rolling back service access records'
		await runRollback(task, prisma.serviceAccess.deleteMany(id(serviceAccess)))
		task.title = 'Rolling back service records'
		await runRollback(task, prisma.orgService.deleteMany(id(orgServices)))
		task.title = 'Rolling back operating hours records'
		await runRollback(task, prisma.orgHours.deleteMany(id(orgHours)))
		task.title = 'Rolling back photo records'
		await runRollback(task, prisma.orgPhoto.deleteMany(src(orgPhotos)))
		task.title = 'Rolling back outside API connection records'
		await runRollback(task, prisma.outsideAPI.deleteMany(apiIdentifier(orgAPIConnections)))
		task.title = 'Rolling back social media records'
		await runRollback(task, prisma.orgSocialMedia.deleteMany(legacyId(orgSocials)))
		task.title = 'Rolling back website records'
		await runRollback(task, prisma.orgWebsite.deleteMany(url(orgWebsites)))
		task.title = 'Rolling back email records'
		await runRollback(task, prisma.orgEmail.deleteMany(id(orgEmails)))
		task.title = 'Rolling back phone records'
		await runRollback(task, prisma.orgPhone.deleteMany(id(orgPhones)))
		task.title = 'Rolling back Organization locations'
		await runRollback(task, prisma.orgLocation.deleteMany(id(orgLocations)))
		task.title = 'Rolling back Organizations'
		await runRollback(task, prisma.organization.deleteMany(legacyId(organizations)))
		task.title = 'Rolling back translation keys'
		await runRollback(task, prisma.translationKey.deleteMany(key(translationKeys)))
		task.title = 'Rolling back Organization description translation keys'
		await runRollback(task, prisma.translationKey.deleteMany(key(orgDescTranslations)))
	} catch (error) {
		migrateLog.info('rollbackOrgs catch')
		migrateLog.error(error)
		throw error
	}
}
export type RollbackOrgs = ReturnType<typeof rollbackOrgs>
