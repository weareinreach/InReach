import { OrgService, Organization, Prisma, PrismaPromise, ServiceArea } from '@prisma/client'
import { readFileSync, writeFileSync } from 'fs'

import { prisma } from '~/index'
import { migrateLog } from '~/seed/logger'
import { Context, ListrTask } from '~/seed/migrate-v1'

import { RollbackObj, outputDir } from './generator'

const rollbackSize = 30_000
const batchSize = 10_000
const updateBatchSize = 500

const recordCount = (count: number) => `${count} ${count === 1 ? 'record' : 'records'}`
const capFirst = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)

const handleError = (error: unknown, data: unknown, task: ListrTask) => {
	migrateLog.info(`handleError called`)
	const detailedError = new Error('Caught error during transaction', { cause: { error, data, task } })
	console.error(detailedError)
	migrateLog.error(JSON.stringify(detailedError))
	// task.report(detailedError, ListrErrorTypes.WILL_ROLLBACK)
	throw detailedError
}
const writeBatch = (batch: unknown[]) => writeFileSync(`${outputDir}batch.json`, JSON.stringify(batch))

const createManyRunner = async (
	task: ListrTask,
	prismaTransaction: PrismaPromise<Prisma.BatchPayload>,
	description: string,
	total: number,
	final: boolean,
	counter: number,
	count: number,
	batches: number
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
		log(
			`💾 ${statusIcon()} [${count}/${batches}] ${capFirst(description)} - submitted: ${total}, generated: ${
				result.count
			}`
		)
		task.title = final ? `${task.title} (${recordCount(counter + result.count)})` : task.title
		return result.count
	} catch (error) {
		migrateLog.error(error)
		handleError(error, {}, task)
	}
}

export const translations = async (task: ListrTask, ctx: Context) => {
	const data: Prisma.TranslationKeyCreateManyInput[] = JSON.parse(
		readFileSync(`${outputDir}translationKeys.json`, 'utf-8')
	)
	ctx.step = 'translationKey'
	try {
		const title = task.title
		let count = 0
		const total = Math.ceil(data.length / batchSize)
		let recordCount = 0
		while (data.length) {
			const batch = data.splice(0, batchSize)
			const final = data.length ? false : true
			task.title = total === 1 ? title : `${title} [batch ${count + 1}/${total}]`
			count++
			writeBatch(batch)
			const result = await createManyRunner(
				task,
				prisma.translationKey.createMany({ data: batch, skipDuplicates: true }),
				'translation key',
				batch.length,
				final,
				recordCount,
				count,
				total
			)
			recordCount += result ?? 0
		}
	} catch (error) {
		const detailedError = new Error('Error during createMany', { cause: { error, data } })
		migrateLog.error(detailedError)
		throw detailedError
	}
}

export const freetext = async (ctx: Context, task: ListrTask) => {
	const data: Prisma.FreeTextCreateManyInput[] = JSON.parse(
		readFileSync(`${outputDir}freeText.json`, 'utf-8')
	)
	ctx.step = 'freeText'
	try {
		const title = task.title
		let count = 0
		const total = Math.ceil(data.length / batchSize)
		let recordCount = 0
		while (data.length) {
			const batch = data.splice(0, batchSize)
			const final = data.length ? false : true
			task.title = total === 1 ? title : `${title} [batch ${count + 1}/${total}]`
			count++
			writeBatch(batch)
			const result = await createManyRunner(
				task,
				prisma.freeText.createMany({ data: batch, skipDuplicates: true }),
				'free text',
				batch.length,
				final,
				recordCount,
				count,
				total
			)
			recordCount += result ?? 0
		}
	} catch (error) {
		writeFileSync('./migrateError.json', JSON.stringify([error, data]))
		handleError(error, data, task)
	}
}

export const locations = async (task: ListrTask, ctx: Context) => {
	const data: Prisma.OrgLocationCreateManyInput[] = JSON.parse(
		readFileSync(`${outputDir}orgLocations.json`, 'utf-8')
	)
	ctx.step = 'orgLocation'
	try {
		const title = task.title
		let count = 0
		const total = Math.ceil(data.length / batchSize)
		let recordCount = 0
		while (data.length) {
			const batch = data.splice(0, batchSize)
			const final = data.length ? false : true
			task.title = total === 1 ? title : `${title} [batch ${count + 1}/${total}]`
			count++
			writeBatch(batch)
			const result = await createManyRunner(
				task,
				prisma.orgLocation.createMany({ data: batch, skipDuplicates: true }),
				'location',
				batch.length,
				final,
				recordCount,
				count,
				total
			)
			recordCount += result ?? 0
		}
	} catch (error) {
		handleError(error, data, task)
	}
}
export const phones = async (task: ListrTask, ctx: Context) => {
	const data: Prisma.OrgPhoneCreateManyInput[] = JSON.parse(
		readFileSync(`${outputDir}orgPhones.json`, 'utf-8')
	)
	ctx.step = 'orgPhone'
	try {
		const title = task.title
		let count = 0
		const total = Math.ceil(data.length / batchSize)
		let recordCount = 0
		while (data.length) {
			const batch = data.splice(0, batchSize)
			const final = data.length ? false : true
			task.title = total === 1 ? title : `${title} [batch ${count + 1}/${total}]`
			count++
			writeBatch(batch)
			const result = await createManyRunner(
				task,
				prisma.orgPhone.createMany({ data: batch, skipDuplicates: true }),
				'phone',
				batch.length,
				final,
				recordCount,
				count,
				total
			)
			recordCount += result ?? 0
		}
	} catch (error) {
		handleError(error, data, task)
	}
}
export const emails = async (task: ListrTask, ctx: Context) => {
	const data: Prisma.OrgEmailCreateManyInput[] = JSON.parse(
		readFileSync(`${outputDir}orgEmails.json`, 'utf-8')
	)
	ctx.step = 'orgEmail'
	try {
		const title = task.title
		let count = 0
		const total = Math.ceil(data.length / batchSize)
		let recordCount = 0
		while (data.length) {
			const batch = data.splice(0, batchSize)
			const final = data.length ? false : true
			task.title = total === 1 ? title : `${title} [batch ${count + 1}/${total}]`
			count++
			writeBatch(batch)
			const result = await createManyRunner(
				task,
				prisma.orgEmail.createMany({ data: batch, skipDuplicates: true }),
				'email',
				batch.length,
				final,
				recordCount,
				count,
				total
			)
			recordCount += result ?? 0
		}
	} catch (error) {
		handleError(error, data, task)
	}
}
export const websites = async (task: ListrTask, ctx: Context) => {
	const data: Prisma.OrgWebsiteCreateManyInput[] = JSON.parse(
		readFileSync(`${outputDir}orgWebsites.json`, 'utf-8')
	)
	ctx.step = 'orgWebsite'
	try {
		const title = task.title
		let count = 0
		const total = Math.ceil(data.length / batchSize)
		let recordCount = 0
		while (data.length) {
			const batch = data.splice(0, batchSize)
			const final = data.length ? false : true
			task.title = total === 1 ? title : `${title} [batch ${count + 1}/${total}]`
			count++
			writeBatch(batch)
			const result = await createManyRunner(
				task,
				prisma.orgWebsite.createMany({ data: batch, skipDuplicates: true }),
				'website',
				batch.length,
				final,
				recordCount,
				count,
				total
			)
			recordCount += result ?? 0
		}
	} catch (error) {
		handleError(error, data, task)
	}
}
export const socials = async (task: ListrTask, ctx: Context) => {
	const data: Prisma.OrgSocialMediaCreateManyInput[] = JSON.parse(
		readFileSync(`${outputDir}orgSocials.json`, 'utf-8')
	)
	ctx.step = 'orgSocialMedia'
	try {
		const title = task.title
		let count = 0
		const total = Math.ceil(data.length / batchSize)
		let recordCount = 0
		while (data.length) {
			const batch = data.splice(0, batchSize)
			const final = data.length ? false : true
			task.title = total === 1 ? title : `${title} [batch ${count + 1}/${total}]`
			count++
			writeBatch(batch)
			const result = await createManyRunner(
				task,
				prisma.orgSocialMedia.createMany({ data: batch, skipDuplicates: true }),
				'social media',
				batch.length,
				final,
				recordCount,
				count,
				total
			)
			recordCount += result ?? 0
		}
	} catch (error) {
		handleError(error, data, task)
	}
}
export const apiConnections = async (task: ListrTask, ctx: Context) => {
	const data: Prisma.OutsideAPICreateManyInput[] = JSON.parse(
		readFileSync(`${outputDir}orgAPIConnections.json`, 'utf-8')
	)
	ctx.step = 'outsideAPI'
	try {
		const title = task.title
		let count = 0
		const total = Math.ceil(data.length / batchSize)
		let recordCount = 0
		while (data.length) {
			const batch = data.splice(0, batchSize)
			const final = data.length ? false : true
			task.title = total === 1 ? title : `${title} [batch ${count + 1}/${total}]`
			count++
			writeBatch(batch)
			const result = await createManyRunner(
				task,
				prisma.outsideAPI.createMany({ data: batch, skipDuplicates: true }),
				'outside API connection',
				batch.length,
				final,
				recordCount,
				count,
				total
			)
			recordCount += result ?? 0
		}
	} catch (error) {
		handleError(error, data, task)
	}
}
export const photos = async (task: ListrTask, ctx: Context) => {
	const data: Prisma.OrgPhotoCreateManyInput[] = JSON.parse(
		readFileSync(`${outputDir}orgPhotos.json`, 'utf-8')
	)
	ctx.step = 'orgPhoto'
	try {
		const title = task.title
		let count = 0
		const total = Math.ceil(data.length / batchSize)
		let recordCount = 0
		while (data.length) {
			const batch = data.splice(0, batchSize)
			const final = data.length ? false : true
			task.title = total === 1 ? title : `${title} [batch ${count + 1}/${total}]`
			count++
			writeBatch(batch)
			const result = await createManyRunner(
				task,
				prisma.orgPhoto.createMany({ data: batch, skipDuplicates: true }),
				'photo',
				batch.length,
				final,
				recordCount,
				count,
				total
			)
			recordCount += result ?? 0
		}
	} catch (error) {
		handleError(error, data, task)
	}
}
export const hours = async (task: ListrTask, ctx: Context) => {
	const data: Prisma.OrgHoursCreateManyInput[] = JSON.parse(
		readFileSync(`${outputDir}orgHours.json`, 'utf-8')
	)
	ctx.step = 'orgHours'
	try {
		const title = task.title
		let count = 0
		const total = Math.ceil(data.length / batchSize)
		let recordCount = 0
		while (data.length) {
			const batch = data.splice(0, batchSize)
			const final = data.length ? false : true
			task.title = total === 1 ? title : `${title} [batch ${count + 1}/${total}]`
			count++
			writeBatch(batch)
			const result = await createManyRunner(
				task,
				prisma.orgHours.createMany({ data: batch, skipDuplicates: true }),
				'operating hours',
				batch.length,
				final,
				recordCount,
				count,
				total
			)
			recordCount += result ?? 0
		}
	} catch (error) {
		handleError(error, data, task)
	}
}
export const services = async (task: ListrTask, ctx: Context) => {
	const data: Prisma.OrgServiceCreateManyInput[] = JSON.parse(
		readFileSync(`${outputDir}orgServices.json`, 'utf-8')
	)
	ctx.step = 'orgService'
	try {
		const title = task.title
		let count = 0
		const total = Math.ceil(data.length / batchSize)
		let recordCount = 0
		while (data.length) {
			const batch = data.splice(0, batchSize)
			const final = data.length ? false : true
			task.title = total === 1 ? title : `${title} [batch ${count + 1}/${total}]`
			count++
			writeBatch(batch)
			const result = await createManyRunner(
				task,
				prisma.orgService.createMany({ data: batch, skipDuplicates: true }),
				'service',
				batch.length,
				final,
				recordCount,
				count,
				total
			)
			recordCount += result ?? 0
		}
	} catch (error) {
		handleError(error, data, task)
	}
}
export const serviceAccess = async (task: ListrTask, ctx: Context) => {
	const data: Prisma.ServiceAccessCreateManyInput[] = JSON.parse(
		readFileSync(`${outputDir}serviceAccess.json`, 'utf-8')
	)
	ctx.step = 'serviceAccess'
	try {
		const title = task.title
		let count = 0
		const total = Math.ceil(data.length / batchSize)
		let recordCount = 0
		while (data.length) {
			const batch = data.splice(0, batchSize)
			const final = data.length ? false : true
			task.title = total === 1 ? title : `${title} [batch ${count + 1}/${total}]`
			count++
			writeBatch(batch)
			const result = await createManyRunner(
				task,
				prisma.serviceAccess.createMany({ data: batch, skipDuplicates: true }),
				'service access',
				batch.length,
				final,
				recordCount,
				count,
				total
			)
			recordCount += result ?? 0
		}
	} catch (error) {
		handleError(error, data, task)
	}
}
export const attributes = async (task: ListrTask, ctx: Context) => {
	const data: Prisma.AttributeRecordCreateManyInput[] = JSON.parse(
		readFileSync(`${outputDir}attributeRecords.json`, 'utf-8')
	)
	ctx.step = 'serviceAccess'
	try {
		const title = task.title
		let count = 0
		const total = Math.ceil(data.length / batchSize)
		let recordCount = 0
		while (data.length) {
			const batch = data.splice(0, batchSize)
			const final = data.length ? false : true
			task.title = total === 1 ? title : `${title} [batch ${count + 1}/${total}]`
			count++
			writeBatch(batch)
			const result = await createManyRunner(
				task,
				prisma.attributeRecord.createMany({ data: batch, skipDuplicates: true }),
				'attribute',
				batch.length,
				final,
				recordCount,
				count,
				total
			)
			recordCount += result ?? 0
		}
	} catch (error) {
		handleError(error, data, task)
	}
}
export const attributeSupplement = async (task: ListrTask, ctx: Context) => {
	const data: Prisma.AttributeSupplementCreateManyInput[] = JSON.parse(
		readFileSync(`${outputDir}attributeSupplements.json`, 'utf-8')
	)
	ctx.step = 'attributeSupplement'
	try {
		const title = task.title
		let count = 0
		const total = Math.ceil(data.length / batchSize)
		let recordCount = 0
		while (data.length) {
			const batch = data.splice(0, batchSize)
			const final = data.length ? false : true
			task.title = total === 1 ? title : `${title} [batch ${count + 1}/${total}]`
			count++
			writeBatch(batch)
			const result = await createManyRunner(
				task,
				prisma.attributeSupplement.createMany({ data: batch, skipDuplicates: true }),
				'attribute supplement',
				batch.length,
				final,
				recordCount,
				count,
				total
			)
			recordCount += result ?? 0
		}
	} catch (error) {
		handleError(error, data, task)
	}
}
export const servAreas = async (task: ListrTask, ctx: Context) => {
	const data: Prisma.ServiceAreaCreateManyInput[] = JSON.parse(
		readFileSync(`${outputDir}serviceAreas.json`, 'utf-8')
	)
	ctx.step = 'serviceArea'
	try {
		const title = task.title
		let count = 0
		const total = Math.ceil(data.length / batchSize)
		let recordCount = 0
		while (data.length) {
			const batch = data.splice(0, batchSize)
			const final = data.length ? false : true
			task.title = total === 1 ? title : `${title} [batch ${count + 1}/${total}]`
			count++
			writeBatch(batch)
			const result = await createManyRunner(
				task,
				prisma.serviceArea.createMany({ data: batch, skipDuplicates: true }),
				'service area',
				batch.length,
				final,
				recordCount,
				count,
				total
			)
			recordCount += result ?? 0
		}
	} catch (error) {
		handleError(error, data, task)
	}
}

export const servAreaConnections = async (task: ListrTask) => {
	const data: Prisma.ServiceAreaUpdateArgs[] = JSON.parse(
		readFileSync(`${outputDir}serviceAreaConnections.json`, 'utf-8')
	)
	const description = 'service area'
	const log = (message: string) => {
		migrateLog.info(message)
		task.output = message
	}
	log(`Updating ${description} records`)
	let counter = 0
	let totalRecords = 0
	const title = task.title
	const queue: Prisma.Prisma__ServiceAreaClient<ServiceArea>[] = []
	task.title = `${title} [batching...]`
	let record = 0
	for (const item of data) {
		try {
			queue.push(prisma.serviceArea.update(item))
			record++
		} catch (error) {
			migrateLog.error(error)
			migrateLog.error(`Last generated transaction: ${record}`)
		}
	}
	const totalBatches = Math.ceil(queue.length / updateBatchSize)

	while (queue.length) {
		const batch = queue.splice(0, updateBatchSize)
		try {
			const result = await prisma.$transaction(batch)
			totalRecords += result.length
			const c = counter + 1
			const message = `📤 Batch ${c} of ${totalBatches} (${result.length} records)`
			task.title = `${title} [batch ${c}/${totalBatches}]`
			log(message)
			counter++
		} catch (error) {
			migrateLog.error(error)
			handleError(error, batch, task)
		}
	}
	log(`💾 ${description} processed: ${totalRecords}`)
	task.title = `${title} (${recordCount(totalRecords)})`
}
export const servConnections = async (task: ListrTask) => {
	const data: Prisma.OrgServiceUpdateArgs[] = JSON.parse(
		readFileSync(`${outputDir}serviceConnections.json`, 'utf-8')
	)
	const description = 'service links'
	const log = (message: string) => {
		migrateLog.info(message)
		task.output = message
	}
	log(`Updating ${description}`)
	let counter = 0
	let totalRecords = 0
	const title = task.title
	const queue: Prisma.Prisma__OrgServiceClient<OrgService>[] = []
	task.title = `${title} [batching...]`
	let record = 0
	for (const item of data) {
		try {
			queue.push(prisma.orgService.update(item))
			record++
		} catch (error) {
			migrateLog.error(error)
			migrateLog.error(`Last generated transaction: ${record}`)
		}
	}
	const totalBatches = Math.ceil(queue.length / updateBatchSize)

	while (queue.length) {
		const batch = queue.splice(0, updateBatchSize)
		try {
			const result = await prisma.$transaction(batch)
			totalRecords += result.length
			const c = counter + 1
			const message = `📤 Batch ${c} of ${totalBatches} (${result.length} records)`
			task.title = `${title} [batch ${c}/${totalBatches}]`
			log(message)
			counter++
		} catch (error) {
			migrateLog.error(error)
			handleError(error, batch, task)
		}
	}
	log(`💾 ${description} processed: ${totalRecords}`)
	task.title = `${title} (${recordCount(totalRecords)})`
}

export const orgConnections = async (task: ListrTask) => {
	const data: Prisma.OrganizationUpdateArgs[] = JSON.parse(
		readFileSync(`${outputDir}orgConnections.json`, 'utf-8')
	)
	const description = 'organization links'
	const log = (message: string) => {
		migrateLog.info(message)
		task.output = message
	}
	log(`Updating ${description}`)
	let counter = 0
	let totalRecords = 0
	const title = task.title
	const queue: Prisma.Prisma__OrganizationClient<Organization>[] = []
	task.title = `${title} [batching...]`
	let record = 0
	for (const item of data) {
		try {
			queue.push(prisma.organization.update(item))
			record++
		} catch (error) {
			migrateLog.error(error)
			migrateLog.error(`Last generated transaction: ${record}`)
		}
	}
	const totalBatches = Math.ceil(queue.length / updateBatchSize)

	while (queue.length) {
		const batch = queue.splice(0, updateBatchSize)
		try {
			const result = await prisma.$transaction(batch)
			totalRecords += result.length
			const c = counter + 1
			const message = `📤 Batch ${c} of ${totalBatches} (${result.length} records)`
			task.title = `${title} [batch ${c}/${totalBatches}]`
			log(message)
			counter++
		} catch (error) {
			migrateLog.error(error)
			handleError(error, batch, task)
		}
	}
	log(`💾 ${description} processed: ${totalRecords}`)
	task.title = `${title} (${recordCount(totalRecords)})`
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

export const rollbackOrgs = async (task: ListrTask, ctx: Context) => {
	const rollback: RollbackObj = JSON.parse(readFileSync(`${outputDir}rollback.json`, 'utf-8'))
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

	migrateLog.info(`Rollback step: ${ctx.step}`)
	task.title = 'Rolling back changes due to error'

	let counter = 0
	let total = 0

	switch (ctx.step) {
		case 'serviceAreas':
			while (serviceAreas.length) {
				total = total === 0 ? serviceAreas.length : total
				const batch = serviceAreas.splice(0, rollbackSize)
				task.title = `Rolling back service area records ${counter + 1}-${counter + batch.length} of ${total}`
				await runRollback(task, prisma.serviceArea.deleteMany(id(batch)))
				counter += batch.length
			}
			counter = 0
			total = 0
		case 'attributeSupplements':
			while (attributeSupplements.length) {
				total = total === 0 ? attributeSupplements.length : total
				const batch = attributeSupplements.splice(0, rollbackSize)
				task.title = `Rolling back attribute supplement records ${counter + 1}-${
					counter + batch.length
				} of ${total}`
				await runRollback(task, prisma.attributeSupplement.deleteMany(id(batch)))
				counter += batch.length
			}
			counter = 0
			total = 0
		case 'attributeRecords':
			while (attributeRecords.length) {
				total = total === 0 ? attributeRecords.length : total
				const batch = attributeRecords.splice(0, rollbackSize)

				task.title = `Rolling back attribute records ${counter + 1}-${counter + batch.length} of ${total}`
				await runRollback(task, prisma.attributeRecord.deleteMany(id(batch)))
				counter += batch.length
			}
			counter = 0
			total = 0
		case 'serviceAccess':
			while (serviceAccess.length) {
				total = total === 0 ? serviceAccess.length : total
				const batch = serviceAccess.splice(0, rollbackSize)
				task.title = `Rolling back service access records ${counter + 1}-${
					counter + batch.length
				} of ${total}`
				await runRollback(task, prisma.serviceAccess.deleteMany(id(batch)))
				counter += batch.length
			}
			counter = 0
			total = 0
		case 'orgServices':
			while (orgServices.length) {
				total = total === 0 ? orgServices.length : total
				const batch = orgServices.splice(0, rollbackSize)
				task.title = `Rolling back service records ${counter + 1}-${counter + batch.length} of ${total}`
				await runRollback(task, prisma.orgService.deleteMany(id(batch)))
				counter += batch.length
			}
			counter = 0
			total = 0
		case 'orgHours':
			while (orgHours.length) {
				total = total === 0 ? orgHours.length : total
				const batch = orgHours.splice(0, rollbackSize)
				task.title = `Rolling back operating hours records ${counter + 1}-${
					counter + batch.length
				} of ${total}`
				await runRollback(task, prisma.orgHours.deleteMany(id(batch)))
				counter += batch.length
			}
			counter = 0
			total = 0
		case 'orgPhotos':
			while (orgPhotos.length) {
				total = total === 0 ? orgPhotos.length : total
				const batch = orgPhotos.splice(0, rollbackSize)
				task.title = `Rolling back photo records ${counter + 1}-${counter + batch.length} of ${total}`
				await runRollback(task, prisma.orgPhoto.deleteMany(src(batch)))
				counter += batch.length
			}
			counter = 0
			total = 0
		case 'orgAPIConnections':
			while (orgAPIConnections.length) {
				total = total === 0 ? orgAPIConnections.length : total
				const batch = orgAPIConnections.splice(0, rollbackSize)
				task.title = `Rolling back outside API connection records ${counter + 1}-${
					counter + batch.length
				} of ${total}`
				await runRollback(task, prisma.outsideAPI.deleteMany(apiIdentifier(batch)))
				counter += batch.length
			}
			counter = 0
			total = 0
		case 'orgSocials':
			while (orgSocials.length) {
				total = total === 0 ? orgSocials.length : total
				const batch = orgSocials.splice(0, rollbackSize)
				task.title = `Rolling back social media records ${counter + 1}-${counter + batch.length} of ${total}`
				await runRollback(task, prisma.orgSocialMedia.deleteMany(legacyId(batch)))
				counter += batch.length
			}
			counter = 0
			total = 0
		case 'orgWebsites':
			while (orgWebsites.length) {
				total = total === 0 ? orgWebsites.length : total
				const batch = orgWebsites.splice(0, rollbackSize)
				task.title = `Rolling back website records ${counter + 1}-${counter + batch.length} of ${total}`
				await runRollback(task, prisma.orgWebsite.deleteMany(url(batch)))
				counter += batch.length
			}
			counter = 0
			total = 0
		case 'orgEmails':
			while (orgEmails.length) {
				total = total === 0 ? orgEmails.length : total
				const batch = orgEmails.splice(0, rollbackSize)
				task.title = `Rolling back email records ${counter + 1}-${counter + batch.length} of ${total}`
				await runRollback(task, prisma.orgEmail.deleteMany(id(batch)))
				counter += batch.length
			}
			counter = 0
			total = 0
		case 'orgPhones':
			while (orgPhones.length) {
				total = total === 0 ? orgPhones.length : total
				const batch = orgPhones.splice(0, rollbackSize)
				task.title = `Rolling back phone records ${counter + 1}-${counter + batch.length} of ${total}`
				await runRollback(task, prisma.orgPhone.deleteMany(id(batch)))
				counter += batch.length
			}
			counter = 0
			total = 0
		case 'orgLocations':
			while (orgLocations.length) {
				total = total === 0 ? orgLocations.length : total
				const batch = orgLocations.splice(0, rollbackSize)
				task.title = `Rolling back Organization locations ${counter + 1}-${
					counter + batch.length
				} of ${total}`
				await runRollback(task, prisma.orgLocation.deleteMany(id(batch)))
				counter += batch.length
			}
			counter = 0
			total = 0
		case 'organizations':
			while (organizations.length) {
				total = total === 0 ? organizations.length : total
				const batch = organizations.splice(0, rollbackSize)
				task.title = `Rolling back Organizations ${counter + 1}-${counter + batch.length} of ${total}`
				await runRollback(task, prisma.organization.deleteMany(legacyId(batch)))
				counter += batch.length
			}
			counter = 0
			total = 0
		case 'translationKeys':
			while (translationKeys.length) {
				total = total === 0 ? translationKeys.length : total
				const batch = translationKeys.splice(0, rollbackSize)
				task.title = `Rolling back translation keys ${counter + 1}-${counter + batch.length} of ${total}`
				await runRollback(task, prisma.translationKey.deleteMany(key(batch)))
				counter += batch.length
			}
			counter = 0
			total = 0
		case 'orgDescTranslations':
			while (orgDescTranslations.length) {
				total = total === 0 ? orgDescTranslations.length : total
				const batch = orgDescTranslations.splice(0, rollbackSize)
				task.title = `Rolling back Organization description translation keys ${counter + 1}-${
					counter + batch.length
				} of ${total}`
				await runRollback(task, prisma.translationKey.deleteMany(key(batch)))
				counter += batch.length
			}
			counter = 0
			total = 0
	}
}
export type RollbackOrgs = ReturnType<typeof rollbackOrgs>
