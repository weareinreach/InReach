import { Prisma, PrismaPromise } from '@prisma/client'

import { prisma } from '~/index'
import { migrateLog } from '~/seed/logger'
import { ListrTask } from '~/seed/migrate-v1'

import {
	attributeRecords,
	attributeSupplements,
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
	serviceAccess as serviceAccessRecords,
	serviceAreas,
	serviceConnections,
	translationKeys,
} from './generator'

const recordCount = (count: number) => `${count} ${count === 1 ? 'record' : 'records'}`

const createManyRunner = async (
	task: ListrTask,
	prismaTransaction: PrismaPromise<Prisma.BatchPayload>,
	description: string
) => {
	const log = (message: string) => {
		migrateLog.info(message)
		task.output = message
	}
	log(`Inserting ${description} records`)
	const result = await prismaTransaction
	log(`💾 ${description} generated: ${result.count}`)
	task.title = `${task.title} (${recordCount(result.count)})`
}

export const translations = async (task: ListrTask) =>
	createManyRunner(
		task,
		prisma.translationKey.createMany({ data: translationKeys, skipDuplicates: true }),
		'translation key'
	)

export const locations = async (task: ListrTask) =>
	createManyRunner(
		task,
		prisma.orgLocation.createMany({ data: orgLocations, skipDuplicates: true }),
		'location'
	)

export const phones = async (task: ListrTask) =>
	createManyRunner(task, prisma.orgPhone.createMany({ data: orgPhones, skipDuplicates: true }), 'phone')
export const emails = async (task: ListrTask) =>
	createManyRunner(task, prisma.orgEmail.createMany({ data: orgEmails, skipDuplicates: true }), 'email')
export const websites = async (task: ListrTask) =>
	createManyRunner(task, prisma.orgWebsite.createMany({ data: orgWebsites, skipDuplicates: true }), 'website')
export const socials = async (task: ListrTask) =>
	createManyRunner(
		task,
		prisma.orgSocialMedia.createMany({ data: orgSocials, skipDuplicates: true }),
		'social media'
	)
export const apiConnections = async (task: ListrTask) =>
	createManyRunner(
		task,
		prisma.outsideAPI.createMany({ data: orgAPIConnections, skipDuplicates: true }),
		'outside API connection'
	)
export const photos = async (task: ListrTask) =>
	createManyRunner(task, prisma.orgPhoto.createMany({ data: orgPhotos, skipDuplicates: true }), 'photo')
export const hours = async (task: ListrTask) =>
	createManyRunner(
		task,
		prisma.orgHours.createMany({ data: orgHours, skipDuplicates: true }),
		'operating hours'
	)
export const services = async (task: ListrTask) =>
	createManyRunner(task, prisma.orgService.createMany({ data: orgServices, skipDuplicates: true }), 'service')
export const serviceAccess = async (task: ListrTask) =>
	createManyRunner(
		task,
		prisma.serviceAccess.createMany({ data: serviceAccessRecords, skipDuplicates: true }),
		'service access'
	)
export const attributes = async (task: ListrTask) =>
	createManyRunner(
		task,
		prisma.attributeRecord.createMany({ data: attributeRecords, skipDuplicates: true }),
		'attribute'
	)
export const attributeSupplement = async (task: ListrTask) =>
	createManyRunner(
		task,
		prisma.attributeSupplement.createMany({ data: attributeSupplements, skipDuplicates: true }),
		'attribute supplement'
	)
export const servAreas = async (task: ListrTask) => {
	const description = 'service area'
	const log = (message: string) => {
		migrateLog.info(message)
		task.output = message
	}
	log(`Upserting ${description} records`)
	let counter = 0
	const c = counter + 1
	const total = serviceAreas.length
	for (const data of serviceAreas) {
		log(`📤 Transaction ${c} of ${total}`)
		await prisma.serviceArea.upsert(data)
		counter++
	}
	log(`💾 ${description} processed: ${c}`)
	task.title = `${task.title} (${recordCount(c)})`
}
export const servConnections = async (task: ListrTask) => {
	const description = 'service links'
	const log = (message: string) => {
		migrateLog.info(message)
		task.output = message
	}
	log(`Updating ${description}`)
	let counter = 0
	const c = counter + 1
	const total = serviceConnections.length
	for (const data of serviceConnections) {
		log(`📤 Transaction ${c} of ${total}`)
		await prisma.orgService.update(data)
		counter++
	}
	log(`💾 ${description} processed: ${c}`)
	task.title = `${task.title} (${recordCount(c)})`
}

export const orgConnections = async (task: ListrTask) => {
	const description = 'organization links'
	const log = (message: string) => {
		migrateLog.info(message)
		task.output = message
	}
	log(`Updating ${description}`)
	let counter = 0
	const c = counter + 1
	const total = orgConnectionRecords.length
	for (const data of orgConnectionRecords) {
		log(`📤 Transaction ${c} of ${total}`)
		await prisma.organization.update(data)
		counter++
	}
	log(`💾 ${description} processed: ${c}`)
	task.title = `${task.title} (${recordCount(c)})`
}
