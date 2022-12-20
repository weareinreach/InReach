import { Prisma, SourceType } from '@prisma/client'
import cuid from 'cuid'
import { flatten } from 'flat'
import fs from 'fs'
import parsePhoneNumber, { type PhoneNumber } from 'libphonenumber-js'
import { DateTime } from 'luxon'
import path from 'path'
import slugify from 'slugify'

import { dayMap, hoursMap, hoursMeta } from '~/datastore/v1/helpers/hours'
import { OrganizationsJSONCollection } from '~/datastore/v1/mongodb/output-types/organizations'
import { prisma } from '~/index'
import { migrateLog } from '~/seed/logger'
import { ListrTask } from '~/seed/migrate-v1'
import {
	AttributeListMap,
	CountryNameMap,
	DistList,
	type GenerateKey,
	type KeyType,
	LanguageMap,
	getCountryId,
	getGovDistId,
	getReferenceData,
	generateKey as keyGenerator,
	parseSchedule,
	serviceTagTranslation,
	uniqueSlug,
} from '~/seed/migrate-v1/org/lib'
import { tagCheck } from '~/seed/migrate-v1/org/lib/attributeHelpers'
import { createPoint } from '~/seed/migrate-v1/org/lib/createPoint'

// const consoleWidth = process.stdout.columns - 10

export const outputDir = `${path.resolve(__dirname, '../out')}/`

export const orgDescTranslations: Prisma.TranslationKeyCreateManyInput[] = []
export const orgDescFreeText: Prisma.FreeTextCreateManyInput[] = []
export const organizations: Prisma.OrganizationCreateManyInput[] = []

const translationKeys: Set<Prisma.TranslationKeyCreateManyInput> = new Set()
const freeText: Set<Prisma.FreeTextCreateManyInput> = new Set()
const orgLocations: Set<Prisma.OrgLocationCreateManyInput> = new Set()
const orgPhones: Set<Prisma.OrgPhoneCreateManyInput> = new Set()
const orgEmails: Set<Prisma.OrgEmailCreateManyInput> = new Set()
const orgWebsites: Set<Prisma.OrgWebsiteCreateManyInput> = new Set()
const orgSocials: Set<Prisma.OrgSocialMediaCreateManyInput> = new Set()
const orgAPIConnections: Set<Prisma.OutsideAPICreateManyInput> = new Set()
const orgPhotos: Set<Prisma.OrgPhotoCreateManyInput> = new Set()
const orgHours: Set<Prisma.OrgHoursCreateManyInput> = new Set()
const orgServices: Set<Prisma.OrgServiceCreateManyInput> = new Set()
const serviceAccess: Set<Prisma.ServiceAccessCreateManyInput> = new Set()
const attributeRecords: Set<Prisma.AttributeRecordCreateManyInput> = new Set()
const attributeSupplements: Set<Prisma.AttributeSupplementCreateManyInput> = new Set()
const serviceAreas: Set<Prisma.ServiceAreaCreateManyInput> = new Set()
const serviceAreaConnections: Set<Prisma.ServiceAreaUpdateArgs> = new Set()
const serviceConnections: Set<Prisma.OrgServiceUpdateArgs> = new Set()
const orgConnections: Set<Prisma.OrganizationUpdateArgs> = new Set()

const batchCount = {
	translationKeys: 0,
	freeText: 0,
	orgLocations: 0,
	orgPhones: 0,
	orgEmails: 0,
	orgWebsites: 0,
	orgSocials: 0,
	orgAPIConnections: 0,
	orgPhotos: 0,
	orgHours: 0,
	orgServices: 0,
	serviceAccess: 0,
	attributeRecords: 0,
	attributeSupplements: 0,
	serviceAreas: 0,
	serviceAreaConnections: 0,
	serviceConnections: 0,
	orgConnections: 0,
}

/**
 * It writes the contents of the various arrays to the corresponding JSON files, and then clears the arrays
 *
 * @param task - ListrTask - this is the task object that is passed to the function. It's used to update the
 *   output of the task.
 * @param [clear=false] - Boolean - if true, the output file will be cleared. Used for initial run. Default is
 *   `false`. Default is `false`
 */
const writeBatches = (task: ListrTask, clear = false) => {
	const log = (message: string) => {
		migrateLog.info(message)
	}
	let outMessage = ``
	const translationKeysBatch: Prisma.TranslationKeyCreateManyInput[] =
		!clear && fs.existsSync(`${outputDir}translationKeys.json`)
			? JSON.parse(fs.readFileSync(`${outputDir}translationKeys.json`, 'utf-8'))
			: []
	fs.writeFileSync(
		`${outputDir}translationKeys.json`,
		JSON.stringify([...translationKeysBatch, ...translationKeys])
	)
	batchCount.translationKeys += translationKeys.size
	outMessage = clear
		? `Clearing file: translationKeys.json`
		: `  Records added to translationKeys.json: ${translationKeys.size}`
	log(outMessage)
	task.output = outMessage
	translationKeys.clear()
	const freeTextBatch: Prisma.FreeTextCreateManyInput[] =
		!clear && fs.existsSync(`${outputDir}freeText.json`)
			? JSON.parse(fs.readFileSync(`${outputDir}freeText.json`, 'utf-8'))
			: []
	fs.writeFileSync(`${outputDir}freeText.json`, JSON.stringify([...freeTextBatch, ...freeText]))
	batchCount.freeText += freeText.size
	outMessage = clear ? `Clearing file: freeText.json` : `  Records added to freeText.json: ${freeText.size}`
	log(outMessage)
	task.output = outMessage
	freeText.clear()
	const orgLocationsBatch: Prisma.OrgLocationCreateManyInput[] =
		!clear && fs.existsSync(`${outputDir}orgLocations.json`)
			? JSON.parse(fs.readFileSync(`${outputDir}orgLocations.json`, 'utf-8'))
			: []
	fs.writeFileSync(`${outputDir}orgLocations.json`, JSON.stringify([...orgLocationsBatch, ...orgLocations]))
	batchCount.orgLocations += orgLocations.size
	outMessage = clear
		? `Clearing file: orgLocations.json`
		: `  Records added to orgLocations.json: ${orgLocations.size}`
	log(outMessage)
	task.output = outMessage
	orgLocations.clear()
	const orgPhonesBatch: Prisma.OrgPhoneCreateManyInput[] =
		!clear && fs.existsSync(`${outputDir}orgPhones.json`)
			? JSON.parse(fs.readFileSync(`${outputDir}orgPhones.json`, 'utf-8'))
			: []
	fs.writeFileSync(`${outputDir}orgPhones.json`, JSON.stringify([...orgPhonesBatch, ...orgPhones]))
	batchCount.orgPhones += orgPhones.size
	outMessage = clear
		? `Clearing file: orgPhones.json`
		: `  Records added to orgPhones.json: ${orgPhones.size}`
	log(outMessage)
	task.output = outMessage
	orgPhones.clear()
	const orgEmailsBatch: Prisma.OrgEmailCreateManyInput[] =
		!clear && fs.existsSync(`${outputDir}orgEmails.json`)
			? JSON.parse(fs.readFileSync(`${outputDir}orgEmails.json`, 'utf-8'))
			: []
	fs.writeFileSync(`${outputDir}orgEmails.json`, JSON.stringify([...orgEmailsBatch, ...orgEmails]))
	batchCount.orgEmails += orgEmails.size
	outMessage = clear
		? `Clearing file: orgEmails.json`
		: `  Records added to orgEmails.json: ${orgEmails.size}`
	log(outMessage)
	task.output = outMessage
	orgEmails.clear()
	const orgWebsitesBatch: Prisma.OrgWebsiteCreateManyInput[] =
		!clear && fs.existsSync(`${outputDir}orgWebsites.json`)
			? JSON.parse(fs.readFileSync(`${outputDir}orgWebsites.json`, 'utf-8'))
			: []
	fs.writeFileSync(`${outputDir}orgWebsites.json`, JSON.stringify([...orgWebsitesBatch, ...orgWebsites]))
	batchCount.orgWebsites += orgWebsites.size
	outMessage = clear
		? `Clearing file: orgWebsites.json`
		: `  Records added to orgWebsites.json: ${orgWebsites.size}`
	log(outMessage)
	task.output = outMessage
	orgWebsites.clear()
	const orgSocialsBatch: Prisma.OrgSocialMediaCreateManyInput[] =
		!clear && fs.existsSync(`${outputDir}orgSocials.json`)
			? JSON.parse(fs.readFileSync(`${outputDir}orgSocials.json`, 'utf-8'))
			: []
	fs.writeFileSync(`${outputDir}orgSocials.json`, JSON.stringify([...orgSocialsBatch, ...orgSocials]))
	batchCount.orgSocials += orgSocials.size
	outMessage = clear
		? `Clearing file: orgSocials.json`
		: `  Records added to orgSocials.json: ${orgSocials.size}`
	log(outMessage)
	task.output = outMessage
	orgSocials.clear()
	const orgAPIConnectionsBatch: Prisma.OutsideAPICreateManyInput[] =
		!clear && fs.existsSync(`${outputDir}orgAPIConnections.json`)
			? JSON.parse(fs.readFileSync(`${outputDir}orgAPIConnections.json`, 'utf-8'))
			: []
	fs.writeFileSync(
		`${outputDir}orgAPIConnections.json`,
		JSON.stringify([...orgAPIConnectionsBatch, ...orgAPIConnections])
	)
	batchCount.orgAPIConnections += orgAPIConnections.size
	outMessage = clear
		? `Clearing file: orgAPIConnections.json`
		: `  Records added to orgAPIConnections.json: ${orgAPIConnections.size}`
	log(outMessage)
	task.output = outMessage
	orgAPIConnections.clear()
	const orgPhotosBatch: Prisma.OrgPhotoCreateManyInput[] =
		!clear && fs.existsSync(`${outputDir}orgPhotos.json`)
			? JSON.parse(fs.readFileSync(`${outputDir}orgPhotos.json`, 'utf-8'))
			: []
	fs.writeFileSync(`${outputDir}orgPhotos.json`, JSON.stringify([...orgPhotosBatch, ...orgPhotos]))
	batchCount.orgPhotos += orgPhotos.size
	outMessage = clear
		? `Clearing file: orgPhotos.json`
		: `  Records added to orgPhotos.json: ${orgPhotos.size}`
	log(outMessage)
	task.output = outMessage
	orgPhotos.clear()
	const orgHoursBatch: Prisma.OrgHoursCreateManyInput[] =
		!clear && fs.existsSync(`${outputDir}orgHours.json`)
			? JSON.parse(fs.readFileSync(`${outputDir}orgHours.json`, 'utf-8'))
			: []
	fs.writeFileSync(`${outputDir}orgHours.json`, JSON.stringify([...orgHoursBatch, ...orgHours]))
	batchCount.orgHours += orgHours.size
	outMessage = clear ? `Clearing file: orgHours.json` : `  Records added to orgHours.json: ${orgHours.size}`
	log(outMessage)
	task.output = outMessage
	orgHours.clear()
	const orgServicesBatch: Prisma.OrgServiceCreateManyInput[] =
		!clear && fs.existsSync(`${outputDir}orgServices.json`)
			? JSON.parse(fs.readFileSync(`${outputDir}orgServices.json`, 'utf-8'))
			: []
	fs.writeFileSync(`${outputDir}orgServices.json`, JSON.stringify([...orgServicesBatch, ...orgServices]))
	batchCount.orgServices += orgServices.size
	outMessage = clear
		? `Clearing file: orgServices.json`
		: `  Records added to orgServices.json: ${orgServices.size}`
	log(outMessage)
	task.output = outMessage
	orgServices.clear()
	const serviceAccessBatch: Prisma.ServiceAccessCreateManyInput[] =
		!clear && fs.existsSync(`${outputDir}serviceAccess.json`)
			? JSON.parse(fs.readFileSync(`${outputDir}serviceAccess.json`, 'utf-8'))
			: []
	fs.writeFileSync(
		`${outputDir}serviceAccess.json`,
		JSON.stringify([...serviceAccessBatch, ...serviceAccess])
	)
	batchCount.serviceAccess += serviceAccess.size
	outMessage = clear
		? `Clearing file: serviceAccess.json`
		: `  Records added to serviceAccess.json: ${serviceAccess.size}`
	log(outMessage)
	task.output = outMessage
	serviceAccess.clear()
	const attributeRecordsBatch: Prisma.AttributeRecordCreateManyInput[] =
		!clear && fs.existsSync(`${outputDir}attributeRecords.json`)
			? JSON.parse(fs.readFileSync(`${outputDir}attributeRecords.json`, 'utf-8'))
			: []
	fs.writeFileSync(
		`${outputDir}attributeRecords.json`,
		JSON.stringify([...attributeRecordsBatch, ...attributeRecords])
	)
	batchCount.attributeRecords += attributeRecords.size
	outMessage = clear
		? `Clearing file: attributeRecords.json`
		: `  Records added to attributeRecords.json: ${attributeRecords.size}`
	log(outMessage)
	task.output = outMessage
	attributeRecords.clear()
	const attributeSupplementsBatch: Prisma.AttributeSupplementCreateManyInput[] =
		!clear && fs.existsSync(`${outputDir}attributeSupplements.json`)
			? JSON.parse(fs.readFileSync(`${outputDir}attributeSupplements.json`, 'utf-8'))
			: []
	fs.writeFileSync(
		`${outputDir}attributeSupplements.json`,
		JSON.stringify([...attributeSupplementsBatch, ...attributeSupplements])
	)
	batchCount.attributeSupplements += attributeSupplements.size
	outMessage = clear
		? `Clearing file: attributeSupplements.json`
		: `  Records added to attributeSupplements.json: ${attributeSupplements.size}`
	log(outMessage)
	task.output = outMessage
	attributeSupplements.clear()
	const serviceAreasBatch: Prisma.ServiceAreaCreateManyInput[] =
		!clear && fs.existsSync(`${outputDir}serviceAreas.json`)
			? JSON.parse(fs.readFileSync(`${outputDir}serviceAreas.json`, 'utf-8'))
			: []
	fs.writeFileSync(`${outputDir}serviceAreas.json`, JSON.stringify([...serviceAreasBatch, ...serviceAreas]))
	batchCount.serviceAreas += serviceAreas.size
	outMessage = clear
		? `Clearing file: serviceAreas.json`
		: `  Records added to serviceAreas.json: ${serviceAreas.size}`
	log(outMessage)
	task.output = outMessage
	serviceAreas.clear()
	const serviceAreaConnectionsBatch: Prisma.ServiceAreaUpdateArgs[] =
		!clear && fs.existsSync(`${outputDir}serviceAreaConnections.json`)
			? JSON.parse(fs.readFileSync(`${outputDir}serviceAreaConnections.json`, 'utf-8'))
			: []
	fs.writeFileSync(
		`${outputDir}serviceAreaConnections.json`,
		JSON.stringify([...serviceAreaConnectionsBatch, ...serviceAreaConnections])
	)
	batchCount.serviceAreaConnections += serviceAreaConnections.size
	outMessage = clear
		? `Clearing file: serviceAreaConnections.json`
		: `  Records added to serviceAreaConnections.json: ${serviceAreaConnections.size}`
	log(outMessage)
	task.output = outMessage
	serviceAreaConnections.clear()
	const serviceConnectionsBatch: Prisma.OrgServiceUpdateArgs[] =
		!clear && fs.existsSync(`${outputDir}serviceConnections.json`)
			? JSON.parse(fs.readFileSync(`${outputDir}serviceConnections.json`, 'utf-8'))
			: []
	fs.writeFileSync(
		`${outputDir}serviceConnections.json`,
		JSON.stringify([...serviceConnectionsBatch, ...serviceConnections])
	)
	batchCount.serviceConnections += serviceConnections.size
	outMessage = clear
		? `Clearing file: serviceConnections.json`
		: `  Records added to serviceConnections.json: ${serviceConnections.size}`
	log(outMessage)
	task.output = outMessage
	serviceConnections.clear()
	const orgConnectionsBatch: Prisma.OrganizationUpdateArgs[] =
		!clear && fs.existsSync(`${outputDir}orgConnections.json`)
			? JSON.parse(fs.readFileSync(`${outputDir}orgConnections.json`, 'utf-8'))
			: []
	fs.writeFileSync(
		`${outputDir}orgConnections.json`,
		JSON.stringify([...orgConnectionsBatch, ...orgConnections])
	)
	batchCount.orgConnections += orgConnections.size
	outMessage = clear
		? `Clearing file: orgConnections.json`
		: `  Records added to orgConnections.json: ${orgConnections.size}`
	log(outMessage)
	task.output = outMessage
	orgConnections.clear()
}

export const rollback: RollbackObj = {
	orgDescTranslations: [],
	organizations: [],
	orgLocations: [],
	translationKeys: [],
	orgPhones: [],
	orgEmails: [],
	orgWebsites: [],
	orgSocials: [],
	orgAPIConnections: [],
	orgPhotos: [],
	orgHours: [],
	orgServices: [],
	serviceAccess: [],
	attributeRecords: [],
	attributeSupplements: [],
	serviceAreas: [],
}

export const isSuccess = (param: unknown) => (!!param ? `✅` : `❌`)

const pluralRecord = (array: unknown[]) => (array.length === 1 ? 'record' : 'records')
const legacyAccessMap = new Map<string, string | undefined>([
	['email', slugify('Service Access Instructions-accessEmail', { lower: true })],
	['file', slugify('Service Access Instructions-accessFile', { lower: true })],
	['link', slugify('Service Access Instructions-accessLink', { lower: true })],
	['location', slugify('Service Access Instructions-accessLocation', { lower: true })],
	['phone', slugify('Service Access Instructions-accessPhone', { lower: true })],
	['other', slugify('Service Access Instructions-accessText', { lower: true })],
])

/**
 * It takes a string or an array of strings and returns an object with a connect property that is either a
 * string or an array of strings
 *
 * @param connections - String | { id: string }[] | undefined
 * @returns A function that takes a string or an array of objects with an id property and returns an object
 *   with a connect property that is either an array of objects with an id property or an object with an id
 *   property.
 */
const connect = (
	connections: string | { id: string }[] | undefined
): ConnectReturn<string | { id: string }[] | undefined> => {
	if (!connections) return undefined
	return Array.isArray(connections) ? { connect: connections } : { connect: { id: connections } }
}
/**
 * It takes an array of objects and returns an object with a connect property that is the array of objects
 *
 * @param {T} connections - T
 * @returns An object with a connect property that is an array of objects.
 */
const connectMulti = <T extends Record<string, unknown>[]>(connections: T): { connect: T } | undefined => {
	if (!connections.length) return undefined
	return { connect: connections }
}
/**
 * It takes an array of records and returns an object with a create property that is an array of records
 *
 * @param {T} records - The records to create.
 * @returns {create: T}
 *
 *   | undefined
 */
const createMulti = <T extends Record<string, unknown>[]>(records: T): { create: T } | undefined => {
	if (!records.length) return undefined
	return { create: records }
}

export const translatedStrings = new Map<string, string>()
/**
 * It takes a key and a translated string, and if both are defined, it adds the key and translated string to
 * the `translatedStrings` map
 *
 * @param {string | undefined} key - The key of the translation.
 * @param {string | undefined} translatedString - The translated string.
 * @param [log] - A function that logs a message to the console.
 */
const exportTranslation = (
	key: string | undefined,
	translatedString: string | undefined,
	log?: (message: string) => void
): void => {
	if (key && translatedString) {
		translatedStrings.set(key, translatedString)
		if (log) {
			log(`🗣️ Translation exported: ${key}`)
		}
	}
}

const unsupportedMap = new Map<string, unknown[]>()
/**
 * It takes a tag object and adds the tag to the `unsupportedMap` if it's not already there
 *
 * @param tagObj - The object of tags that are being exported.
 */
const exportUnsupported = (tagObj: Record<string, unknown>) => {
	const serviceCityRegex = /(?:service-city-|service-town-).*/
	const langRegex = /lang-.*/
	for (let [key, value] of Object.entries(tagObj)) {
		if (serviceCityRegex.test(key)) {
			value = key
			key = 'Service Area Cities'
		}
		if (langRegex.test(key)) {
			value = key
			key = 'Languages'
		}
		const newValue = new Set([value].concat(unsupportedMap.get(key)))
		unsupportedMap.set(key, [...newValue])
	}
}

const translationKeySet = new Set<string>()
const checkKey = (key: string) => translationKeySet.has(key)
/**
 * It generates a key, checks if it exists, and if it does, it throws an error
 *
 * @param params -
 * @returns An object with key, namespace, and text
 */
const generateKey: GenerateKey<KeyType> = (params) => {
	const output = keyGenerator(params)
	if (output.key && checkKey(output.key)) {
		const cause = {
			attempted: output,
			existingRecord:
				[...translationKeySet].find((x) => x === output.key) ??
				orgDescTranslations.find((x) => x.key === output.key),
		}

		migrateLog.error(JSON.stringify(cause, null, 1))
		throw new Error('Translation key already exists!', {
			cause,
		})
	}
	output.key ? translationKeySet.add(output.key) : undefined
	return output
}

export const slugSet = new Set<string>()

/**
 * It reads the organizations.json file, generates a slug for each organization, creates a translation key for
 * the organization description, and creates a new organization record in the database
 *
 * @param task - ListrTask - this is the task object that is passed to the function. It's used to update the
 *   task title and output.
 * @returns A listr task
 */
export const migrateOrgs = async (task: ListrTask) => {
	const orgs: OrganizationsJSONCollection[] = JSON.parse(
		fs.readFileSync('./datastore/v1/mongodb/output/organizations.json', 'utf-8')
	)

	const dbOrgs = await prisma.organization.findMany({ select: { id: true, legacyId: true, slug: true } })
	const orgMap = new Map(dbOrgs.map((x) => [x.legacyId, x.id]))
	dbOrgs.forEach((x) => slugSet.add(x.slug))

	const usedKeys = await prisma.translationKey.findMany({ select: { key: true } })
	usedKeys.forEach((x) => translationKeySet.add(x.key))

	const log = (message: string) => {
		migrateLog.info(message)
		// task.output = message.substring(0, consoleWidth)
	}

	log(`🏗️ Upserting Source record.`)
	const sourceText = `migration` as string
	const { id: sourceId } = await prisma.source.upsert({
		where: { source: sourceText },
		create: { source: sourceText, type: 'SYSTEM' as SourceType },
		update: {},
		select: { id: true },
	})

	const generate = async (task: ListrTask) => {
		let countOrg = 0
		let skipOrg = 0
		log(`🛠️ Generating Organization records...`)
		for (const org of orgs) {
			const count = countOrg + skipOrg + 1
			const [createdAt, updatedAt] = [org.created_at.$date, org.updated_at.$date]
			/* Slug generation */
			task.title = `Generate records [${count}/${orgs.length}]`
			if (orgMap.get(org._id.$oid)) {
				const existing = orgMap.get(org._id.$oid)
				log(`🤷 SKIPPING ${org.name}: Organization exists in db: ${existing}`)
				skipOrg++
				continue
			}
			const primaryLocation = org.locations.find((location) => location.is_primary)
			const slug = await uniqueSlug(org.name, primaryLocation?.city, primaryLocation?.state)
			slugSet.add(slug)
			/* Description Translation Key */
			let descriptionId: string | undefined
			const {
				key: descriptionKey,
				ns: descriptionNs,
				text: descriptionText,
			} = generateKey({
				type: 'desc',
				orgSlug: slug,
				text: org.description,
			})
			if (descriptionKey && descriptionNs && descriptionText) {
				const [key, ns, text] = [descriptionKey, descriptionNs, descriptionText]
				const id = cuid()
				orgDescTranslations.push({
					key,
					ns,
					text,
					createdAt,
					updatedAt,
				})
				orgDescFreeText.push({ id, key, ns, createdAt, updatedAt })
				translationKeySet.add(descriptionKey)
				rollback.orgDescTranslations.push(descriptionKey)
				descriptionId = id
				log(
					`🗣️ Organization description. Namespace: ${descriptionNs}, Key: ${descriptionKey}, Org free text: ${id}`
				)
				exportTranslation(descriptionKey, org.description_ES, log)
			}

			organizations.push({
				name: org.name,
				slug,
				legacySlug: org.slug,
				sourceId,
				descriptionId,
				published: org.is_published,
				deleted: org.is_deleted,
				legacyId: org._id.$oid,
				lastVerified: org.verified_at?.$date,
				createdAt,
				updatedAt,
			})
			rollback.organizations.push(org._id.$oid)
			log(
				`🛠️ [${count}/${orgs.length}] Generated ${org.name}: Slug: ${isSuccess(
					slug
				)}, Description: ${isSuccess(descriptionKey && descriptionNs)}`
			)
			countOrg++
			// if (countOrg === 50) break
		}
		log(`⚙️ Organization records generated: ${organizations.length}`)
		log(`⚙️ Organization description translation key records generated: ${orgDescTranslations.length}`)
		log(`⚙️ Organization description free text link records generated: ${orgDescFreeText.length}`)
	}
	const process = async (task: ListrTask) => {
		let translationRecordCount = 0
		/* Create translation keys for descriptions */
		if (orgDescTranslations.length) {
			const results = await prisma.translationKey.createMany({
				data: orgDescTranslations,
				skipDuplicates: true,
			})
			translationRecordCount = results.count
			log(`🏗️ Translation Keys created: ${results.count}`)
			if (orgDescFreeText.length) {
				const results = await prisma.freeText.createMany({
					data: orgDescFreeText,
					skipDuplicates: true,
				})
				log(`🏗️ Free text records created: ${results.count}`)
			}
		}
		/* Create Organization records */
		const orgResults = await prisma.organization.createMany({ data: organizations, skipDuplicates: true })
		log(`🏗️ Organization records created: ${orgResults.count}`)
		task.title = `Generate & create base organization records (${orgResults.count} organizations, ${
			translationRecordCount ?? 0
		} translation keys)`
	}
	return task.newListr([
		{
			title: 'Generate records',
			task: async (_ctx, task): Promise<void> => generate(task),
		},
		{
			title: 'Insert records',
			task: async (_ctx, task): Promise<void> => process(task),
		},
	])
}

export const generateRecords = async (task: ListrTask) => {
	const orgs: OrganizationsJSONCollection[] = JSON.parse(
		fs.readFileSync('./datastore/v1/mongodb/output/organizations.json', 'utf-8')
	)
	const log = (message: string) => {
		migrateLog.info(message)
		// task.output = message.substring(0, consoleWidth)
	}

	const {
		attributeList,
		countryMap,
		countryNameMap,
		distList,
		distMap,
		langMap,
		localeMap,
		permissionMap,
		serviceTags,
		socialMediaMap,
		userMap,
	} = await getReferenceData()
	const tagHelpers: TagHelper = {
		countryNameMap,
		distList,
		attributeList,
		langMap,
	}
	const orgIdMap = new Map<string, string>()
	const orgSlugMap = new Map<string, string>()
	let batchCounter = 0
	const batchSize = 200
	const maxBatches = Math.ceil(orgs.length / batchSize)

	const prepare = async () => {
		writeBatches(task, true)

		/* Get all records & create a Map of legacyId -> id */
		const orgRecords = await prisma.organization.findMany({
			select: { id: true, legacyId: true, name: true, slug: true },
		})

		log(`🐕 Fetched ${orgRecords.length} Organization records.`)

		log(`🏗️ Creating Organization ID map...`)

		for (const record of orgRecords) {
			const { id, legacyId, name, slug } = record
			if (!legacyId) {
				log(`🤷 Missing legacyId: ${name}`)
				continue
			}
			orgIdMap.set(legacyId, id)
			orgSlugMap.set(legacyId, slug)
		}
		log(`🏗️ Organization ID map created with ${orgIdMap.size} records.`)
	}

	/* Loop over orgs again to create supplemental records.*/
	const generate = (task: ListrTask) => {
		log(`🛠️ Generating linked records...`)
		let orgCount = 0
		for (const org of orgs) {
			task.title = `Generate supplemental organization records [${orgCount + 1}/${orgs.length}]`
			let countLoc = 0
			let skipLoc = 0
			const orgId = orgIdMap.get(org._id.$oid)
			const orgSlug = orgSlugMap.get(org._id.$oid)
			const createdAt = org.created_at.$date
			const updatedAt = org.updated_at.$date
			/* To connect records to Services. */
			const newLocationMap = new Map<string, string>()
			const newEmailMap = new Map<string, string>()
			const newPhoneMap = new Map<string, string>()
			const newScheduleMap = new Map<string, { id: string }[]>()
			if (!orgId) {
				log(`🤷 SKIPPING ${org.name}: Could not find record ID`)
				continue
			}
			/* Generate location records */
			if (!org.locations.length) {
				log(`🤷 SKIPPING Location records for ${org.name}: No locations`)
			} else {
				log(`🛠️ Generating Location ${pluralRecord(org.locations)} for ${org.name}`)
				for (const location of org.locations) {
					const count = countLoc + skipLoc + 1
					if (!location.country && !location.city && !location.state) {
						log(
							`🤷 [${count}/${org.locations.length}] SKIPPING ${org.name} - ${location._id.$oid}: Missing city, state, & country.`
						)
						skipLoc++
						continue
					}
					log(`🛠️ [${count}/${org.locations.length}] Location: ${location.name ?? location._id.$oid}`)
					const locId = cuid()
					const [longitude, latitude] = location.geolocation.coordinates.map(
						(x) => +parseFloat(x.$numberDecimal).toFixed(3)
					)
					newLocationMap.set(location._id.$oid, locId)
					orgLocations.add({
						id: locId,
						orgId,
						legacyId: location._id.$oid,
						name: location.name,
						street1: location.address ?? '',
						street2: location.unit,
						city: location.city ?? '',
						postCode: location.zip_code,
						primary: location.is_primary ?? false,
						govDistId: getGovDistId(location, distMap),
						countryId: getCountryId(location, countryMap),
						longitude,
						latitude,
						geoJSON: createPoint({ longitude, latitude }),
						published: location.show_on_organization,
						createdAt,
						updatedAt,
					})
					rollback.orgLocations.push(locId)
					countLoc++
				}
				log(
					`🛠️ Location ${pluralRecord(org.locations)} for ${
						org.name
					}: ${countLoc} generated, ${skipLoc} skipped.`
				)
			}

			/* Generate phone records */
			if (!org.phones.length) {
				log(`🤷 SKIPPING Phone records for ${org.name}: No phone numbers`)
			} else {
				let countPhone = 0
				let skipPhone = 0
				log(`🛠️ Generating Phone ${pluralRecord(org.phones)} for ${org.name}`)
				for (const phone of org.phones) {
					const count = countPhone + skipPhone + 1
					if (!phone.digits) {
						log(
							`🤷 [${count}/${org.phones.length}] SKIPPING ${org.name} - ${phone._id.$oid}: Missing phone number.`
						)
						skipPhone++
						continue
					}
					log(`🛠️ [${count}/${org.phones.length}] Phone number: ${phone.phone_type ?? phone._id.$oid}`)
					const countryCodes = ['US', 'CA', 'MX'] as const
					let phoneData: PhoneNumber | undefined
					for (const country of countryCodes) {
						phoneData = parsePhoneNumber(phone.digits, country)
						if (phoneData?.country) break
					}
					const countryId = countryMap.get(phoneData?.country ?? 'US')
					if (!countryId) throw new Error('Unable to retrieve Country ID')
					const migrationReview = phoneData ? true : undefined
					const id = cuid()
					newPhoneMap.set(phone._id.$oid, id)
					orgPhones.add({
						id,
						legacyId: phone._id.$oid,
						organizationId: orgId,
						countryId,
						number: phoneData?.nationalNumber ?? phone.digits,
						ext: phoneData?.ext,
						primary: phone.is_primary ?? false,
						published: phone.show_on_organization ?? false,
						legacyDesc: phone.phone_type,
						createdAt,
						updatedAt,
						migrationReview,
					})
					rollback.orgPhones.push(id)
					countPhone++
				}
				log(
					`🛠️ Phone ${pluralRecord(org.phones)} for ${org.name}: ${countPhone} generated, ${skipLoc} skipped`
				)
			}

			/* Generate email records */
			if (!org.emails.length) {
				log(`🤷 SKIPPING Email records for ${org.name}: No email addresses`)
			} else {
				let countEmail = 0
				let skipEmail = 0
				log(`🛠️ Generating Email ${pluralRecord(org.emails)} for ${org.name}`)
				for (const email of org.emails) {
					const count = countEmail + skipEmail + 1
					if (!email.email) {
						log(
							`🤷 [${count}/${org.emails.length}] SKIPPING ${org.name} - ${email._id.$oid}: Missing email address.`
						)
						skipEmail++
						continue
					}
					log(`🛠️ [${count}/${org.emails.length}] Email: ${email.title ?? email._id.$oid}`)
					const id = cuid()
					newEmailMap.set(email._id.$oid, id)
					orgEmails.add({
						id,
						email: email.email,
						orgId,
						legacyId: email._id.$oid,
						firstName: email.first_name ?? undefined,
						lastName: email.last_name ?? undefined,
						legacyDesc: email.title ?? undefined,
						primary: email.is_primary ?? false,
						published: email.show_on_organization ?? false,
						createdAt,
						updatedAt,
					})
					rollback.orgEmails.push(id)
					countEmail++
				}
				log(
					`🛠️ Email ${pluralRecord(org.emails)} for ${
						org.name
					}: ${countEmail} generated, ${skipEmail} skipped`
				)
			}

			/* Generate website records */
			if (!org.website && !org.website_ES) {
				log(`🤷 SKIPPING Website records for ${org.name}: No websites`)
			} else {
				let countWebsite = 0
				// eslint-disable-next-line prefer-const
				let count = countWebsite + 1
				const total = org.website?.length && org.website_ES?.length ? 2 : 1
				const sites =
					org.website && org.website_ES ? [org.website, org.website_ES] : [org.website ?? org.website_ES]
				log(`🛠️ Generating Website ${pluralRecord(sites)} for ${org.name}`)
				if (org.website?.length) {
					log(`🛠️ [${count}/${total}] Website: ${org.website}`)
					orgWebsites.add({
						organizationId: orgId,
						url: org.website,
						createdAt,
						updatedAt,
					})
					rollback.orgWebsites.push(org.website)
					countWebsite++
				}
				if (org.website_ES?.length) {
					log(`🛠️ [${count}/${total}] Website: ${org.website_ES}`)
					const languageId = localeMap.get('es')
					orgWebsites.add({
						organizationId: orgId,
						url: org.website_ES,
						languageId,
						createdAt,
						updatedAt,
					})
					rollback.orgWebsites.push(org.website_ES)
					countWebsite++
				}
				log(`🛠️ Website ${pluralRecord(sites)} for ${org.name}: ${countWebsite} generated, 0 skipped`)
			}

			/* Generate Social Media Records */
			if (!org.social_media || !org.social_media.length) {
				log(`🤷 SKIPPING Social Media records for ${org.name}: No profiles`)
			} else {
				let countSocial = 0
				let skipSocial = 0
				const regex =
					/(?:(?:http|https):\/\/|)(?:www\.|)(\w*)\.com\/(?:channel\/|user\/|in\/|company\/|)([a-zA-Z0-9._-]{1,})/
				log(`🛠️ Generating Social Media ${pluralRecord(org.social_media)} for ${org.name}`)
				for (const social of org.social_media) {
					const count = countSocial + skipSocial + 1
					const [, service, username] = regex.exec(social.url) ?? [undefined, undefined, '']
					const servLookup = social.name ? social.name : service ?? ''
					const serviceId = socialMediaMap.get(servLookup)
					if (!serviceId) {
						log(
							`🤷 [${count}/${org.social_media.length}] SKIPPING ${org.name} - ${social.url}: Unable to determine service.`
						)
						skipSocial++
						continue
					}
					log(`🛠️ [${count}/${org.social_media.length}] Social Media: ${servLookup}`)
					orgSocials.add({
						organizationId: orgId,
						serviceId,
						url: social.url,
						username,
						createdAt,
						updatedAt,
						legacyId: social._id.$oid,
					})
					rollback.orgSocials.push(social._id.$oid)
					countSocial++
				}
				log(
					`🛠️ Social Media ${pluralRecord(org.social_media)} for ${
						org.name
					}: ${countSocial} generated, ${skipSocial} skipped`
				)
			}

			/* Generate Photo & Outside API Connection Records */
			if (!org.photos || !org.photos.length) {
				log(`🤷 SKIPPING Photo records for ${org.name}: No photos`)
			} else {
				let countPhoto = 0
				const skipPhoto = 0
				log(`🛠️ Generating Photo ${pluralRecord(org.photos)} for ${org.name}`)
				let apiCreated = false
				for (const photo of org.photos) {
					const count = countPhoto + skipPhoto + 1
					if (!apiCreated) {
						log(`🛠️ Generating Outside API Connection record for ${org.name}`)
						orgAPIConnections.add({
							serviceName: 'foursquare',
							apiIdentifier: photo.foursquare_vendor_id,
							createdAt,
							updatedAt,
						})
						rollback.orgAPIConnections.push(photo.foursquare_vendor_id)
						apiCreated = true
					}
					log(`🛠️ [${count}/${org.photos.length}] Photo Record`)
					const { src, height, width } = photo
					orgPhotos.add({
						orgId,
						src,
						height: Math.round(height),
						width: Math.round(width),
					})
					rollback.orgPhotos.push(src)
					countPhoto++
				}
				log(`🛠️ Outside API Connection record for ${org.name}: ${isSuccess(apiCreated)}`)
				log(
					`🛠️ Photo ${pluralRecord(org.photos)} for ${
						org.name
					}: ${countPhoto} generated, ${skipPhoto} skipped`
				)
			}

			/* Generate Hours records */
			if (!org.schedules.length) {
				log(`🤷 SKIPPING Hours records for ${org.name}: No schedules`)
			} else {
				let countHours = 0
				let skipHours = 0
				let totalRecordsGenerated = 0
				const needAssignment = org.locations.length > 1
				const helpers = { dayMap, hoursMap, hoursMeta }
				log(`🛠️ Generating Hours ${pluralRecord(org.schedules)} for ${org.name}`)

				for (const schedule of org.schedules) {
					const count = countHours + skipHours + 1
					const hours = parseSchedule(schedule, helpers)
					let recordsGenerated = 0
					if (!hours) {
						log(
							`🤷 [${count}/${org.schedules.length}] SKIPPING ${org.name} - ${
								schedule.name ?? schedule._id.$oid
							}: Unable to parse schedule.`
						)
						skipHours++
						continue
					}
					log(`🛠️ [${count}/${org.schedules.length}] Schedule: ${schedule.name ?? schedule._id.$oid}`)
					const newIds = new Set<string>()
					for (const [key, value] of Object.entries(hours)) {
						if (!value || !value.start || !value.end) continue
						const { start, end, closed, legacyId, legacyName, legacyNote, legacyTz } = value
						let { needReview } = value
						const id = cuid()
						if (!start || !end) needReview = true
						newIds.add(id)
						orgHours.add({
							id,
							organizationId: orgId,
							dayIndex: parseInt(key),
							start: DateTime.fromFormat(start ?? '00:00', 'HH:mm').toJSDate(),
							end: DateTime.fromFormat(end ?? '00:00', 'HH:mm').toJSDate(),
							closed,
							legacyId,
							legacyName,
							legacyNote,
							legacyTz,
							needAssignment,
							needReview,
						})
						rollback.orgHours.push(id)
						recordsGenerated++
					}
					const newIdConnections = Array.from(newIds).map((x) => ({ id: x }))
					newScheduleMap.set(schedule._id.$oid, newIdConnections)
					totalRecordsGenerated += recordsGenerated
					countHours++
				}
				log(
					`🛠️ Hours ${pluralRecord(org.schedules)} for ${
						org.name
					}: ${totalRecordsGenerated} generated from ${countHours} schedules, ${skipHours} skipped`
				)
			}

			const orgServAreaCountry = new Set<string>()
			const orgServAreaDist = new Set<string>()
			let orgServiceAreaCreated = false
			let orgServiceAreaId: string | undefined = undefined
			/* Generate Org Attributes */
			if (!org.properties || !Object.keys(org.properties).length) {
				log(`🤷 SKIPPING Attribute records for ${org.name}: No attributes attached to organization`)
			} else {
				let counter = 0
				let skips = 0
				let supplements = 0
				let servAreas = 0
				const total = Object.keys(org.properties).length
				log(`🛠️ Generating Attribute ${pluralRecord(Object.keys(org.properties))} for ${org.name}`)
				const unsupportedAttributes: Record<string, unknown>[] = []

				const organizationId = orgIdMap.get(org._id.$oid)
				if (!organizationId) break

				for (const [tag, value] of Object.entries(org.properties)) {
					const count = counter + skips + 1
					if (!tag) {
						skips++
					}

					const newAttrId = cuid()
					const tagRecord = tagCheck({ tag, value, helpers: tagHelpers })
					if (tagRecord.type !== 'unknown') {
						log(
							`🛠️ [${count}/${total}] Organization ${
								tagRecord.type === 'area' ? 'Service Area' : 'Attribute'
							}: ${tagRecord.type === 'area' ? tagRecord.attribute.name : tagRecord.attribute.tag}`
						)
					}

					switch (tagRecord.type) {
						case 'unknown':
							if (!tagRecord.data) {
								tagRecord.data = { [tag]: value }
							}
							log(`🤷 [${count}/${total}] Unsupported attribute: ${Object.keys(tagRecord.data).join()}`)
							unsupportedAttributes.push(tagRecord.data)
							exportUnsupported(tagRecord.data)
							break
						case 'attribute': {
							const { attribute: attrRecord, data: attrData } = tagRecord
							/* Checking the attribute record for the attribute type and then creating the attribute accordingly. */
							const attrBase = {
								attributeId: newAttrId,
								createdAt,
								updatedAt,
							}
							attributeRecords.add({
								id: newAttrId,
								attributeId: attrRecord.id,
								organizationId,
								createdAt,
								updatedAt,
							})
							rollback.attributeRecords.push(newAttrId)
							switch (true) {
								case attrRecord.requireBoolean: {
									const boolean = attrData?.boolean
									if (!boolean) break
									log(`🛠️ Attribute boolean supplement: ${boolean}`)
									supplements++
									const id = cuid()
									attributeSupplements.add({ ...attrBase, id, boolean })
									rollback.attributeSupplements.push(id)
									break
								}
								case attrRecord.requireLanguage: {
									const languageId = attrData?.language
									if (!languageId) break
									log(`🛠️ Attribute language supplement: Attached record ${attrData?.language}`)
									supplements++
									const id = cuid()
									attributeSupplements.add({ ...attrBase, id, languageId })
									rollback.attributeSupplements.push(id)
									break
								}
								case attrRecord.requireText: {
									const text = attrData?.text
									if (!text || !orgSlug) break
									const suppId = cuid()
									const textId = cuid()
									const { key, ns, text: keyText } = generateKey({ type: 'attrSupp', orgSlug, suppId, text })
									if (!key || !ns || !keyText) break
									log(`🗣️ Attribute text supplement. Namespace: ${ns}, Key: ${key}, Free Text: ${textId}`)
									supplements++
									if (key && ns) {
										translationKeys.add({ key, ns, text: keyText, createdAt, updatedAt })
										freeText.add({ id: textId, key, ns, createdAt, updatedAt })
										attributeSupplements.add({ ...attrBase, id: suppId, textId, createdAt, updatedAt })
										rollback.translationKeys.push(key)
										rollback.attributeSupplements.push(suppId)
									}
									break
								}
							}
							break
						}
						case 'area': {
							// connect service area
							log(`🛠️ Service Area: ${tagRecord.attribute.name}`)
							if (tagRecord.attribute.id) {
								servAreas++
								if (!orgServiceAreaCreated) {
									const id = cuid()

									serviceAreas.add({
										id,
										organizationId,
										createdAt,
										updatedAt,
									})
									rollback.serviceAreas.push(id)
									orgServiceAreaCreated = true
									orgServiceAreaId = id
								}
								tagRecord.attribute.type === 'country'
									? orgServAreaCountry.add(tagRecord.attribute.id)
									: orgServAreaDist.add(tagRecord.attribute.id)
							} else {
								log(`🤷 Cannot link - missing associated record id`)
							}

							break
						}
					}

					counter++
				}

				if (unsupportedAttributes.length) {
					const attributeId = attributeList.get('system-incompatible-info')?.id
					if (!attributeId) throw new Error('Cannot find "incompatible info" tag')
					const recordId = cuid()
					const suppId = cuid()
					attributeRecords.add({
						attributeId,
						organizationId,
						id: recordId,
						createdAt,
						updatedAt,
					})
					rollback.attributeRecords.push(recordId)
					log(`🛠️ Attribute supplement- Unsupported items: ${unsupportedAttributes.length}`)
					attributeSupplements.add({
						id: suppId,
						attributeId: recordId,
						createdAt,
						updatedAt,
						data: JSON.stringify(unsupportedAttributes),
					})
					rollback.attributeRecords.push(suppId)
				}

				log(
					`🛠️ Attribute ${pluralRecord(Object.keys(org.properties))} for ${org.name}: ${counter} ${
						counter === 1 ? 'Attribute' : 'Attributes'
					}, ${supplements} ${
						supplements === 1 ? 'Supplemental record' : 'Supplemental records'
					}, ${servAreas} ${servAreas === 1 ? 'Service area' : 'Service areas'}, ${
						unsupportedAttributes.length
					} ${unsupportedAttributes.length === 1 ? 'Unsupported attribute' : 'Unsupported attributes'}`
				)
			}

			/* Generate Services */
			if (!org.services.length) {
				log(`🤷 SKIPPING Service records for ${org.name}: No services listed`)
			} else {
				let counter = 0
				const skips = 0
				log(`🛠️ Generating Service ${pluralRecord(org.services)} for ${org.name}`)

				for (const service of org.services) {
					let accessCount = 0
					const count = counter + skips + 1
					const serviceId = cuid()
					log(`🛠️ [${count}/${org.services.length}] Service: ${service.name}`)
					const {
						key: descriptionKey,
						ns: descriptionNs,
						text: descriptionText,
					} = generateKey({
						type: 'svc',
						subtype: 'desc',
						orgSlug,
						servId: serviceId,
						text: service.description,
					})
					let descriptionId: string | undefined
					if (descriptionKey && descriptionNs && descriptionText) {
						const id = cuid()
						const [key, ns, text] = [descriptionKey, descriptionNs, descriptionText]
						translationKeys.add({
							key,
							ns,
							text,
							createdAt,
							updatedAt,
						})
						freeText.add({ id, key, ns, createdAt, updatedAt })
						rollback.translationKeys.push(descriptionKey)
						descriptionId = id

						log(`🗣️ Service description. Namespace: ${ns}, Key: ${key}, Free Text: ${id}`)
						exportTranslation(descriptionKey, service.description_ES, log)
					}

					if (service.access_instructions.length) {
						log(`🛠️ Generating Service Access ${pluralRecord(service.access_instructions)}`)
					}

					/* Access Instruction records*/
					for (const access of service.access_instructions) {
						const accessId = cuid()
						const attributeRecordId = cuid()
						const attributeSuppId = cuid()
						const newTag = legacyAccessMap.get(access.access_type ?? '')
						const attribute = attributeList.get(newTag ?? '')
						if (!attribute) {
							log(`🤷 SKIPPING Access record ${access._id.$oid}: Cannot map attribute`)
							continue
						}
						let textId: string | undefined
						if (access.instructions) {
							const { key, ns, text } = generateKey({
								type: 'attrSupp',
								orgSlug,
								suppId: attributeSuppId,
								text: access.instructions?.trim(),
							})
							const freeTextId = cuid()
							if (key && ns && text) {
								translationKeys.add({
									key,
									ns,
									text,
									createdAt,
									updatedAt,
								})
								freeText.add({ id: freeTextId, key, ns, createdAt, updatedAt })
								rollback.translationKeys.push(key)
								log(`🗣️ Service access instructions. Namespace: ${ns}, Key: ${key}, Free text: ${freeTextId}`)
								exportTranslation(freeTextId, access.instructions_ES, log)
								textId = freeTextId
							}
						}

						attributeRecords.add({
							id: attributeRecordId,
							attributeId: attribute.id,
							serviceAccessId: accessId,
							createdAt,
							updatedAt,
						})
						rollback.attributeRecords.push(attributeRecordId)
						attributeSupplements.add({
							id: attributeSuppId,
							attributeId: attributeRecordId,
							createdAt,
							updatedAt,
							textId,
							data: JSON.stringify(access),
						})
						rollback.attributeSupplements.push(attributeSuppId)
						serviceAccess.add({
							id: accessId,
							serviceId,
						})
						rollback.serviceAccess.push(accessId)
						log(
							`\t🔑 Service Access Instruction: '${
								access.instructions?.trim() ?? access._id.$oid
							}' - Valid link: ${isSuccess(
								[...attributeRecords].at(-1)?.serviceAccessId ?? '0' === [...serviceAccess].at(-1)?.id ?? '1'
							)}`
						)
						accessCount++
					}

					/* Basic Service Record*/
					orgServices.add({
						id: serviceId,
						descriptionId,
						createdAt,
						updatedAt,
						legacyId: service._id.$oid,
						legacyName: service.name,
						organizationId: orgId,
						published: service.is_published,
						deleted: service.is_deleted,
					})
					rollback.orgServices.push(serviceId)

					/* Generate Service Attributes */
					const servAreaCountry = new Set<string>()
					const servAreaDist = new Set<string>()
					let serviceAreaCreated = false
					let serviceAreaId: string | undefined = undefined
					if (!service.properties || !Object.keys(service.properties).length) {
						log(`🤷 SKIPPING Attribute records for ${service.name}: No attributes attached to service`)
					} else {
						let counter = 0
						let skips = 0
						let supplements = 0
						let servAreas = 0
						const total = Object.keys(service.properties).length
						log(
							`🛠️ Generating Attribute ${pluralRecord(Object.keys(service.properties))} for ${service.name}`
						)
						const unsupportedAttributes: Record<string, unknown>[] = []

						const organizationId = orgId

						for (const [tag, value] of Object.entries(service.properties)) {
							const count = counter + skips + 1
							if (!tag) {
								skips++
							}

							const newAttrId = cuid()
							const tagValue = Array.isArray(value) ? JSON.stringify(value) : value
							const tagRecord = tagCheck({ tag, value: tagValue, helpers: tagHelpers })
							if (tagRecord.type !== 'unknown') {
								log(
									`🛠️ [${count}/${total}] ${
										tagRecord.type === 'area' ? 'Service Area' : 'Service Attribute'
									}: ${tagRecord.type === 'area' ? tagRecord.attribute.name : tagRecord.attribute.tag}`
								)
							}

							switch (tagRecord.type) {
								case 'unknown':
									if (!tagRecord.data) {
										log(`🤷 SKIPPING unsupported attribute: no data returned`)
										break
									}
									log(`🤷 [${count}/${total}] Unsupported attribute: ${Object.keys(tagRecord.data).join()}`)
									unsupportedAttributes.push(tagRecord.data)
									exportUnsupported(tagRecord.data)
									break
								case 'attribute': {
									const { attribute: attrRecord, data: attrData } = tagRecord
									/* Checking the attribute record for the attribute type and then creating the attribute accordingly. */
									const attrBase = {
										attributeId: newAttrId,
										createdAt,
										updatedAt,
									}
									attributeRecords.add({
										id: newAttrId,
										attributeId: attrRecord.id,
										organizationId,
										createdAt,
										updatedAt,
									})
									rollback.attributeRecords.push(newAttrId)
									switch (true) {
										case attrRecord.requireBoolean: {
											const boolean = attrData?.boolean
											if (!boolean) break
											log(`🛠️ Attribute boolean supplement: ${boolean}`)
											supplements++
											const id = cuid()
											attributeSupplements.add({ ...attrBase, id, boolean })
											rollback.attributeSupplements.push(id)
											break
										}
										case attrRecord.requireLanguage: {
											const languageId = attrData?.language
											if (!languageId) break
											log(`🛠️ Attribute language supplement: Attached record ${attrData?.language}`)
											supplements++
											const id = cuid()
											attributeSupplements.add({ ...attrBase, id, languageId })
											rollback.attributeSupplements.push(id)
											break
										}
										case attrRecord.requireText: {
											const text = attrData?.text?.trim()
											if (!text || !orgSlug) break
											const suppId = cuid()
											const {
												key,
												ns,
												text: keyText,
											} = generateKey({ type: 'attrSupp', orgSlug, suppId, text })
											if (!key || !ns || !keyText) break
											const textId = cuid()
											log(`🗣️ Attribute text supplement. Namespace: ${ns}, Key: ${key}, Free text: ${textId}`)
											supplements++
											if (key && ns) {
												translationKeys.add({ key, ns, text: keyText, createdAt, updatedAt })
												freeText.add({ id: textId, key, ns, createdAt, updatedAt })
												rollback.translationKeys.push(key)
											}
											attributeSupplements.add({ ...attrBase, id: suppId, textId, createdAt, updatedAt })
											rollback.attributeSupplements.push(suppId)
											break
										}
									}
									break
								}
								case 'area': {
									// connect service area
									log(`🛠️ Service Area: ${tagRecord.attribute.name}`)
									if (tagRecord.attribute.id) {
										servAreas++
										if (!serviceAreaCreated) {
											const id = cuid()

											serviceAreas.add({
												id,
												// organizationId,
												orgServiceId: serviceId,
												createdAt,
												updatedAt,
											})
											rollback.serviceAreas.push(id)
											serviceAreaCreated = true
											serviceAreaId = id
										}
										tagRecord.attribute.type === 'country'
											? servAreaCountry.add(tagRecord.attribute.id)
											: servAreaDist.add(tagRecord.attribute.id)
									} else {
										log(`🤷 Cannot link - missing associated record id`)
									}

									break
								}
							}

							counter++
						}
						if (unsupportedAttributes.length) {
							const attributeId = attributeList.get('system-incompatible-info')?.id
							if (!attributeId) throw new Error('Cannot find "incompatible info" tag')
							const recordId = cuid()
							attributeRecords.add({
								id: recordId,
								attributeId,
								organizationId,
								createdAt,
								updatedAt,
							})
							rollback.attributeRecords.push(recordId)
							log(`🛠️ Attribute supplement- Unsupported items: ${unsupportedAttributes.length}`)
							const suppId = cuid()
							attributeSupplements.add({
								id: suppId,
								attributeId: recordId,
								createdAt,
								updatedAt,
								data: JSON.stringify(unsupportedAttributes),
							})
							rollback.attributeSupplements.push(suppId)
						}

						log(
							`🛠️ Attribute ${pluralRecord(Object.keys(service.properties))} for ${
								service.name
							}: ${counter} ${counter === 1 ? 'Attribute' : 'Attributes'}, ${supplements} ${
								supplements === 1 ? 'Supplemental record' : 'Supplemental records'
							}, ${servAreas} ${servAreas === 1 ? 'Service area' : 'Service areas'}, ${
								unsupportedAttributes.length
							} ${unsupportedAttributes.length === 1 ? 'Unsupported attribute' : 'Unsupported attributes'}`
						)
					}

					/* Generate Service Tags */
					const serviceTagConnection: Prisma.ServiceTagWhereUniqueInput[] = []
					if (!service.tags || !Object.keys(service.tags).length) {
						log(`🤷 SKIPPING Attribute records for ${service.name}: No tags attached to service`)
					} else {
						let counter = 0
						const skips = 0
						const tagSet = new Map<string, string>()

						for (const topVal of Object.values(service.tags)) {
							const flatServ = flatten(topVal) as Record<string, unknown>
							if (!Object.keys(topVal).length) {
								continue
							}
							for (const [key] of Object.entries(flatServ)) {
								const normalizedTag = serviceTagTranslation.get(key)
								const tag = serviceTags.get(normalizedTag ?? '')
								if (!tag || !normalizedTag) {
									log(`🤷 SKIPPING Attribute ${key}: unable to map to Service Tag.`)
									continue
								}
								tagSet.set(normalizedTag, tag)
							}
						}

						const tagObj = Object.fromEntries(tagSet)
						const totalTags = Object.keys(tagObj).length
						if (!totalTags) {
							log(`🤷 SKIPPING Attribute records for ${service.name}: No tags to attach`)
							continue
						}
						for (const [key, value] of Object.entries(tagObj)) {
							log(`🔗 [${counter + 1}/${totalTags}] Generating Service Tag Link: ${key}`)

							serviceTagConnection.push({ id: value })

							counter++
						}
						log(
							`🔗 Generated ${counter} Service Tag ${
								counter === 1 ? 'link' : 'links'
							}. Invalid tags skipped: ${skips}`
						)
					}

					/* Connect to existing records, if they exist.*/
					const email = newEmailMap.get(service.email_id ?? '')
					const location = newLocationMap.get(service.location_id ?? '')
					const phone = newPhoneMap.get(service.phone_id ?? '')
					const schedule = newScheduleMap.get(service.schedule_id ?? '')

					log(
						`🔗 Generating link - Hours: ${isSuccess(schedule?.length)}, Email: ${isSuccess(
							email
						)}, Location: ${isSuccess(location)}, Phone: ${isSuccess(phone)}, Service Areas: ${isSuccess(
							serviceAreaCreated
						)}`
					)
					serviceConnections.add({
						where: {
							id: serviceId,
						},
						data: {
							hours: connect(schedule),
							orgEmail: connect(email),
							orgLocation: connect(location),
							orgPhone: connect(phone),
							service: connectMulti(serviceTagConnection),
						},
					})
					const servCountriesToLink = servAreaCountry.size
						? Array.from(servAreaCountry).map((id) => ({ id }))
						: []
					const servAreasToLink = servAreaDist.size ? Array.from(servAreaDist).map((id) => ({ id })) : []

					if (serviceAreaId) {
						serviceAreaConnections.add({
							where: {
								id: serviceAreaId,
							},
							data: {
								country: connectMulti(servCountriesToLink),
								areas: connectMulti(servAreasToLink),
							},
						})
					}
					log(
						`🛠️ Generated ${service.name}: Access Info: ${isSuccess(accessCount)}, Description: ${isSuccess(
							descriptionKey && descriptionNs
						)}`
					)

					counter++
				}
			}
			/* Generate user permissions */
			const orgLinkedUsers: Prisma.UserWhereUniqueInput[] = []
			const orgCreateEditors: Prisma.PermissionAssetCreateWithoutOrganizationInput[] = []

			const editOrgPerm = permissionMap.get('editSingleOrg')

			if (org.owners?.length && editOrgPerm) {
				log(`🛠️ Generating claimed user ${pluralRecord(org.owners)} for ${org.name}`)
				let counter = 0
				let skips = 0

				for (const owner of org.owners) {
					const count = counter + skips + 1
					const userId = userMap.get(owner.userId)
					if (!userId) {
						log(`🤷 SKIPPING connection for ${owner.userId}: Cannot map userId`)
						skips++
						continue
					}
					orgLinkedUsers.push({ id: userId })
					orgCreateEditors.push({
						permission: connect(editOrgPerm) as ConnectIdString,
						user: connect(userId) as ConnectIdString,
						approved: owner.isApproved,
						createdAt,
						updatedAt,
					})

					log(
						`🛠️ [${count}/${org.owners.length}] Org owner records for: ${
							owner.userId
						} - Linked to org: ${isSuccess(true)}, Permission record: ${isSuccess(
							true
						)} (Approved: ${isSuccess(owner.isApproved)})`
					)
					counter++
				}
			}

			/* Connect records to Org */
			log(
				`🔗 Generating link - Associated Users: ${isSuccess(
					orgLinkedUsers.length
				)}, Allowed Editors: ${isSuccess(orgCreateEditors.length)} Service Areas: ${isSuccess(
					orgServiceAreaCreated
				)}`
			)
			orgConnections.add({
				where: {
					id: orgId,
				},
				data: {
					associatedUsers: connectMulti(orgLinkedUsers),
					allowedEditors: createMulti(orgCreateEditors),
				},
			})
			if (orgServiceAreaId) {
				serviceAreaConnections.add({
					where: {
						id: orgServiceAreaId,
					},
					data: {
						country: connectMulti(Array.from(orgServAreaCountry).map((id) => ({ id }))),
						areas: connectMulti(Array.from(orgServAreaDist).map((id) => ({ id }))),
					},
				})
			}

			orgCount++

			// if (orgCount === 1) break
			if (orgCount % batchSize === 0 || orgCount === organizations.length) {
				batchCounter++
				const message = `✍️ Writing batch ${batchCounter} of ${maxBatches} to file`
				log(message)
				task.output = message
				writeBatches(task)
			}
		}
		const translationsOut = Object.fromEntries(translatedStrings)
		log(`🛠️ Generating translation JSON file (${translatedStrings.size} translations)`)
		fs.writeFileSync('es-migration.json', JSON.stringify(translationsOut))

		const unsupportedAttOut = Object.fromEntries(unsupportedMap)
		log(`🛠️ Generating unsupported attribute JSON file (${unsupportedMap.size} attributes)`)
		fs.writeFileSync('unsupportedAttributes.json', JSON.stringify(unsupportedAttOut))

		log(`✍️ Writing rollback file`)
		fs.writeFileSync(`${outputDir}rollback.json`, JSON.stringify(rollback))

		log(`⚙️ Translation keys generated: ${batchCount.translationKeys}`)
		log(`⚙️ Free text link records generated: ${batchCount.freeText}`)
		log(`⚙️ Organization locations generated: ${batchCount.orgLocations}`)
		log(`⚙️ Phone records generated: ${batchCount.orgPhones}`)
		log(`⚙️ Email records generated: ${batchCount.orgEmails}`)
		log(`⚙️ Website records generated: ${batchCount.orgWebsites}`)
		log(`⚙️ Social media records generated: ${batchCount.orgSocials}`)
		log(`⚙️ Outside API connection records generated: ${batchCount.orgAPIConnections}`)
		log(`⚙️ Organization photo records generated: ${batchCount.orgPhotos}`)
		log(`⚙️ Operating hours records generated: ${batchCount.orgHours}`)
		log(`⚙️ Service records generated: ${batchCount.orgServices}`)
		log(`⚙️ Service access records generated: ${batchCount.serviceAccess}`)
		log(`⚙️ Attribute records generated: ${batchCount.attributeRecords}`)
		log(`⚙️ Attribute supplements generated: ${batchCount.attributeSupplements}`)
		log(`⚙️ Service area records generated: ${batchCount.serviceAreas}`)
		log(`⚙️ Service link updates generated: ${batchCount.serviceConnections}`)
		log(`⚙️ Organization link updates generated: ${batchCount.orgConnections}`)
		log(`⚙️ Service area link updates generated: ${batchCount.serviceAreaConnections}`)
	}

	return task.newListr([
		{
			title: 'Prepare maps',
			task: async (): Promise<void> => prepare(),
			options: {
				bottomBar: 20,
				persistentOutput: false,
			},
		},
		{
			title: 'Generate supplemental organization records',
			task: async (_ctx, task): Promise<void> => generate(task),
			options: {
				bottomBar: 20,
			},
		},
	])
}

type ConnectReturn<T extends string | { id: string }[] | undefined> = T extends string
	? { connect: { id: T } }
	: T extends undefined
	? undefined
	: { connect: T }

type ConnectIdString = { connect: { id: string } }

export type HoursHelper = {
	dayMap: typeof dayMap
	hoursMap: typeof hoursMap
	hoursMeta: typeof hoursMeta
}
export type TagHelper = {
	countryNameMap: CountryNameMap
	distList: DistList
	attributeList: AttributeListMap
	langMap: LanguageMap
}

export type RollbackObj = {
	/** `key` */
	orgDescTranslations: string[]
	/** `legacyId` */
	organizations: string[]
	/** `id` */
	orgLocations: string[]
	/** `key` */
	translationKeys: string[]
	/** `id` */
	orgPhones: string[]
	/** `id` */
	orgEmails: string[]
	/** `url` */
	orgWebsites: string[]
	/** `legacyId` */
	orgSocials: string[]
	/** `apiIdentifier` */
	orgAPIConnections: string[]
	/** `src` */
	orgPhotos: string[]
	/** `id` */
	orgHours: string[]
	/** `id` */
	orgServices: string[]
	/** `id` */
	serviceAccess: string[]
	/** `id` */
	attributeRecords: string[]
	/** `id` */
	attributeSupplements: string[]
	/** `id` */
	serviceAreas: string[]
}
