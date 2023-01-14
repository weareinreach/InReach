/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import cuid from 'cuid'
import { flatten } from 'flat'
import parsePhoneNumber, { type PhoneNumber } from 'libphonenumber-js'
import { DateTime } from 'luxon'
import superjson from 'superjson'
import invariant from 'tiny-invariant'

import { SourceType } from '~/client'
import fs from 'fs'

import { dayMap, hoursMap, hoursMeta } from '~/datastore/v1/helpers/hours'
import path from 'path'

import { OrganizationsJSONCollection } from '~/datastore/v1/mongodb/output-types/organizations'
import { prisma } from '~/index'
import { Log, iconList } from '~/seed/lib'
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
	legacyAccessMap,
	parseSchedule,
	serviceTagTranslation,
	uniqueSlug,
} from '~/seed/migrate-v1/org/lib'
import { tagCheck } from '~/seed/migrate-v1/org/lib/attributeHelpers'
import { createPoint } from '~/seed/migrate-v1/org/lib/createPoint'
import {
	batchCount,
	batchNameMap,
	data,
	initialData,
	outputDir,
	rollback,
	writeBatches,
} from '~/seed/migrate-v1/org/outData'

// const consoleWidth = process.stdout.columns - 10

export const generatedDir = `${path.resolve(__dirname, '../_generated')}/`
export const rollbackFile = `${outputDir}rollback.json`
export const isSuccess = (param: unknown) => (!!param ? `✅` : `❌`)

const pluralRecord = (array: unknown[]) => (array.length === 1 ? 'record' : 'records')

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
				[...initialData.orgTranslationKey].find((x) => x.key === output.key),
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
	const log: Log = (message, icon?, indent = false, silent = true) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		migrateLog.info(formattedMessage)
		if (!silent) task.output = formattedMessage
	}

	const { orgFreeText, orgTranslationKey, organization } = initialData

	const dbOrgs = await prisma.organization.findMany({ select: { id: true, legacyId: true, slug: true } })
	const orgMap = new Map(dbOrgs.map((x) => [x.legacyId, x.id]))
	dbOrgs.forEach((x) => slugSet.add(x.slug))

	const usedKeys = await prisma.translationKey.findMany({ select: { key: true } })
	usedKeys.forEach((x) => translationKeySet.add(x.key))

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
				log(`SKIPPING ${org.name}: Organization exists in db: ${existing}`, 'skip', false, true)
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
				keyPrefix: slug,
				text: org.description,
			})
			if (descriptionKey && descriptionNs && descriptionText) {
				const [key, ns, text] = [descriptionKey, descriptionNs, descriptionText]
				const id = cuid()
				orgTranslationKey.add({
					key,
					ns,
					text,
					createdAt,
					updatedAt,
				})
				orgFreeText.add({ id, key, ns, createdAt, updatedAt })
				translationKeySet.add(descriptionKey)
				rollback.translationKey.add(descriptionKey)
				descriptionId = id
				log(
					`🗣️ Organization description. Namespace: ${descriptionNs}, Key: ${descriptionKey}, Org free text: ${id}`
				)
				exportTranslation(descriptionKey, org.description_ES, log)
			}
			const id = cuid()
			organization.add({
				id,
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
			rollback.organization.add(id)
			log(
				`🛠️ [${count}/${orgs.length}] Generated ${org.name}: Slug: ${isSuccess(
					slug
				)}, Description: ${isSuccess(descriptionKey && descriptionNs)}`
			)
			countOrg++
			// if (countOrg === 50) break
		}
		log(`⚙️ Organization records generated: ${organization.size}`)
		log(`⚙️ Organization description translation key records generated: ${orgTranslationKey.size}`)
		log(`⚙️ Organization description free text link records generated: ${orgFreeText.size}`)
	}
	const process = async (task: ListrTask) => {
		let translationRecordCount = 0
		/* Create translation keys for descriptions */
		if (orgTranslationKey.size) {
			const results = await prisma.translationKey.createMany({
				data: [...orgTranslationKey],
				skipDuplicates: true,
			})
			translationRecordCount = results.count
			log(`🏗️ Translation Keys created: ${results.count}`)
			if (orgFreeText.size) {
				const results = await prisma.freeText.createMany({
					data: [...orgFreeText],
					skipDuplicates: true,
				})
				log(`🏗️ Free text records created: ${results.count}`)
			}
		}
		/* Create Organization records */
		const orgResults = await prisma.organization.createMany({ data: [...organization], skipDuplicates: true })
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
	const log: Log = (message, icon?, indent = false, silent = true) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		migrateLog.info(formattedMessage)
		if (!silent) task.output = formattedMessage
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
	const batchSize = 500
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
			const linkedAt = createdAt
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
					data.orgLocation.add({
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
					rollback.orgLocation.add(locId)
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
					const countryCodes = ['US', 'CA', 'MX', 'PR', 'VI'] as const
					let phoneData: PhoneNumber | undefined
					for (const country of countryCodes) {
						phoneData = parsePhoneNumber(phone.digits, country)
						if (phoneData?.country) {
							break
						}
					}
					const countryId = countryMap.get(phoneData?.country ?? 'US')
					if (!countryId) throw new Error('Unable to retrieve Country ID')
					const migrationReview = phoneData ? true : undefined
					const id = cuid()
					newPhoneMap.set(phone._id.$oid, id)
					data.orgPhone.add({
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
					rollback.orgPhone.add(id)

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
					data.orgEmail.add({
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
					rollback.orgEmail.add(id)
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
					const id = cuid()
					data.orgWebsite.add({
						id,
						organizationId: orgId,
						url: org.website,
						createdAt,
						updatedAt,
					})
					rollback.orgWebsite.add(id)
					countWebsite++
				}
				if (org.website_ES?.length) {
					log(`🛠️ [${count}/${total}] Website: ${org.website_ES}`)
					const languageId = localeMap.get('es')
					const id = cuid()
					data.orgWebsite.add({
						id,
						organizationId: orgId,
						url: org.website_ES,
						createdAt,
						updatedAt,
					})
					if (languageId) {
						data.orgWebsiteLanguage.add({
							orgWebsiteId: id,
							languageId,
						})
					}
					rollback.orgWebsite.add(id)
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
					data.orgSocialMedia.add({
						organizationId: orgId,
						serviceId,
						url: social.url,
						username,
						createdAt,
						updatedAt,
						legacyId: social._id.$oid,
					})
					rollback.orgSocialMedia.add(social._id.$oid)
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
						const id = cuid()
						data.outsideAPI.add({
							id,
							serviceName: 'foursquare',
							apiIdentifier: photo.foursquare_vendor_id,
							createdAt,
							updatedAt,
						})
						rollback.outsideAPI.add(id)
						apiCreated = true
					}
					log(`🛠️ [${count}/${org.photos.length}] Photo Record`)
					const { src, height, width } = photo
					const id = cuid()
					data.orgPhoto.add({
						id,
						orgId,
						src,
						height: Math.round(height),
						width: Math.round(width),
					})
					rollback.orgPhoto.add(id)
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
						data.orgHours.add({
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
						rollback.orgHours.add(id)
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

			let orgServiceAreaCreated = false
			let serviceAreaId: string | undefined = undefined
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
								createdAt,
								updatedAt,
							}
							const suppBase = {
								attributeId: attrRecord.id,
								organizationId,
								linkedAt,
							}
							data.organizationAttribute.add({
								organizationId,
								attributeId: attrRecord.id,
							})
							switch (true) {
								case attrRecord.requireBoolean: {
									const boolean = attrData?.boolean
									if (!boolean) break
									log(`🛠️ Attribute boolean supplement: ${boolean}`)
									supplements++
									const id = cuid()
									data.attributeSupplement.add({ ...attrBase, id, boolean })
									rollback.attributeSupplement.add(id)
									data.organizationAttributeSupplement.add({ ...suppBase, supplementId: id })
									break
								}
								case attrRecord.requireLanguage: {
									const languageId = attrData?.language
									if (!languageId) break
									log(`🛠️ Attribute language supplement: Attached record ${attrData?.language}`)
									supplements++
									const id = cuid()
									data.attributeSupplement.add({ ...attrBase, id, languageId })
									rollback.attributeSupplement.add(id)
									data.organizationAttributeSupplement.add({ ...suppBase, supplementId: id })
									break
								}
								case attrRecord.requireText: {
									const text = attrData?.text
									if (!text || !orgSlug) break
									const suppId = cuid()
									const textId = cuid()
									const {
										key,
										ns,
										text: keyText,
									} = generateKey({ type: 'attrSupp', keyPrefix: orgSlug, suppId, text })
									if (!key || !ns || !keyText) break
									log(`🗣️ Attribute text supplement. Namespace: ${ns}, Key: ${key}, Free Text: ${textId}`)
									supplements++
									if (key && ns) {
										data.translationKey.add({ key, ns, text: keyText, createdAt, updatedAt })
										data.freeText.add({ id: textId, key, ns, createdAt, updatedAt })
										data.attributeSupplement.add({ ...attrBase, id: suppId, textId, createdAt, updatedAt })
										rollback.translationKey.add(key)
										rollback.attributeSupplement.add(suppId)
										data.organizationAttributeSupplement.add({ ...suppBase, supplementId: suppId })
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

									data.serviceArea.add({
										id,
										organizationId,
										createdAt,
										updatedAt,
									})
									rollback.serviceArea.add(id)
									orgServiceAreaCreated = true
									serviceAreaId = id
								}
								invariant(
									serviceAreaId,
									'No service area ID. This should have been created & carried over to other loops.'
								)
								tagRecord.attribute.type === 'country'
									? data.serviceAreaCountry.add({ serviceAreaId, countryId: tagRecord.attribute.id })
									: data.serviceAreaDist.add({ serviceAreaId, govDistId: tagRecord.attribute.id })
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
					const suppId = cuid()
					data.organizationAttribute.add({
						attributeId,
						organizationId,
					})
					log(`🛠️ Attribute supplement- Unsupported items: ${unsupportedAttributes.length}`)
					data.attributeSupplement.add({
						id: suppId,
						createdAt,
						updatedAt,
						data: JSON.stringify(unsupportedAttributes),
					})
					rollback.attributeSupplement.add(suppId)
					data.organizationAttributeSupplement.add({ attributeId, organizationId, supplementId: suppId })
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
						keyPrefix: orgSlug,
						servId: serviceId,
						text: service.description,
					})
					let descriptionId: string | undefined
					if (descriptionKey && descriptionNs && descriptionText) {
						const id = cuid()
						const [key, ns, text] = [descriptionKey, descriptionNs, descriptionText]
						data.translationKey.add({
							key,
							ns,
							text,
							createdAt,
							updatedAt,
						})
						data.freeText.add({ id, key, ns, createdAt, updatedAt })
						rollback.translationKey.add(descriptionKey)
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
								keyPrefix: orgSlug,
								suppId: attributeSuppId,
								text: access.instructions?.trim(),
							})
							const freeTextId = cuid()
							if (key && ns && text) {
								data.translationKey.add({
									key,
									ns,
									text,
									createdAt,
									updatedAt,
								})
								data.freeText.add({ id: freeTextId, key, ns, createdAt, updatedAt })
								rollback.translationKey.add(key)
								log(`🗣️ Service access instructions. Namespace: ${ns}, Key: ${key}, Free text: ${freeTextId}`)
								exportTranslation(freeTextId, access.instructions_ES, log)
								textId = freeTextId
							}
						}

						data.serviceAccessAttribute.add({
							attributeId: attribute.id,
							serviceAccessId: accessId,
							linkedAt,
						})
						data.attributeSupplement.add({
							id: attributeSuppId,
							createdAt,
							updatedAt,
							textId,
							data: JSON.stringify(access),
						})
						rollback.attributeSupplement.add(attributeSuppId)
						data.serviceAccess.add({
							id: accessId,
							serviceId,
						})
						rollback.serviceAccess.add(accessId)
						data.serviceAccessAttributeSupplement.add({
							attributeId: attribute.id,
							supplementId: attributeSuppId,
							serviceAccessId: accessId,
							linkedAt,
						})
						log(`\t🔑 Service Access Instruction: '${access.instructions?.trim() ?? access._id.$oid}'`)
						accessCount++
					}

					/* Basic Service Record*/
					data.orgService.add({
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
					rollback.orgService.add(serviceId)

					/* Generate Service Attributes */
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

						for (const [tag, value] of Object.entries(service.properties)) {
							const count = counter + skips + 1
							if (!tag) {
								skips++
							}

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
										createdAt,
										updatedAt,
									}
									const suppBase = {
										attributeId: attrRecord.id,
										orgServiceId: serviceId,
										linkedAt,
									}
									data.serviceAttribute.add({
										attributeId: attrRecord.id,
										orgServiceId: serviceId,
										linkedAt,
									})
									switch (true) {
										case attrRecord.requireBoolean: {
											const boolean = attrData?.boolean
											if (!boolean) break
											log(`🛠️ Attribute boolean supplement: ${boolean}`)
											supplements++
											const id = cuid()
											data.attributeSupplement.add({ ...attrBase, id, boolean })
											rollback.attributeSupplement.add(id)
											data.serviceAttributeSupplement.add({ ...suppBase, supplementId: id })
											break
										}
										case attrRecord.requireLanguage: {
											const languageId = attrData?.language
											if (!languageId) break
											log(`🛠️ Attribute language supplement: Attached record ${attrData?.language}`)
											supplements++
											const id = cuid()
											data.attributeSupplement.add({ ...attrBase, id, languageId })
											rollback.attributeSupplement.add(id)
											data.serviceAttributeSupplement.add({ ...suppBase, supplementId: id })
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
											} = generateKey({ type: 'attrSupp', keyPrefix: orgSlug, suppId, text })
											if (!key || !ns || !keyText) break
											const textId = cuid()
											log(`🗣️ Attribute text supplement. Namespace: ${ns}, Key: ${key}, Free text: ${textId}`)
											supplements++
											if (key && ns) {
												data.translationKey.add({ key, ns, text: keyText, createdAt, updatedAt })
												data.freeText.add({ id: textId, key, ns, createdAt, updatedAt })
												rollback.translationKey.add(key)
											}
											data.attributeSupplement.add({ ...attrBase, id: suppId, textId, createdAt, updatedAt })
											rollback.attributeSupplement.add(suppId)
											data.serviceAttributeSupplement.add({ ...suppBase, supplementId: suppId })
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

											data.serviceArea.add({
												id,
												orgServiceId: serviceId,
												createdAt,
												updatedAt,
											})
											rollback.serviceArea.add(id)
											serviceAreaCreated = true
											serviceAreaId = id
										}
										invariant(
											serviceAreaId,
											'No service area ID. This should have been created & carried over to other loops.'
										)
										tagRecord.attribute.type === 'country'
											? data.serviceAreaCountry.add({ serviceAreaId, countryId: tagRecord.attribute.id })
											: data.serviceAreaDist.add({ serviceAreaId, govDistId: tagRecord.attribute.id })
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
							data.serviceAttribute.add({
								attributeId,
								orgServiceId: serviceId,
								linkedAt,
							})
							log(`🛠️ Attribute supplement- Unsupported items: ${unsupportedAttributes.length}`)
							const suppId = cuid()
							data.attributeSupplement.add({
								id: suppId,
								createdAt,
								updatedAt,
								data: JSON.stringify(unsupportedAttributes),
							})
							rollback.attributeSupplement.add(suppId)
							data.serviceAttributeSupplement.add({
								attributeId,
								orgServiceId: serviceId,
								supplementId: suppId,
								linkedAt,
							})
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
					if (!service.tags || !Object.keys(service.tags).length) {
						log(`🤷 SKIPPING Attribute records for ${service.name}: No tags attached to service`)
					} else {
						let counter = 0
						const skips = 0
						const tagSet = new Map<string, string>()

						for (const topVal of Object.values(service.tags)) {
							const flatServ = flatten<object, Record<string, string>>(topVal)
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
							data.orgServiceTag.add({ serviceId, tagId: value, linkedAt })

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

					log(
						`🔗 Generating link - Email: ${isSuccess(email)}, Location: ${isSuccess(
							location
						)}, Phone: ${isSuccess(phone)},`
					)
					if (email) data.orgServiceEmail.add({ serviceId, orgEmailId: email })
					if (phone) data.orgServicePhone.add({ serviceId, orgPhoneId: phone })
					if (location) data.orgLocationService.add({ serviceId, orgLocationId: location })

					log(
						`🛠️ Generated ${service.name}: Access Info: ${isSuccess(accessCount)}, Description: ${isSuccess(
							descriptionKey && descriptionNs
						)}`
					)

					counter++
				}
			}

			/* Generate user permissions */

			const permissionId = permissionMap.get('editSingleOrg')

			if (org.owners?.length && permissionId) {
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
					data.userToOrganization.add({ userId, organizationId: orgId })
					data.userPermission.add({ userId, permissionId })
					rollback.userPermission.add(userId)
					data.organizationPermission.add({
						userId,
						permissionId,
						organizationId: orgId,
						authorized: owner.isApproved,
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
			orgCount++

			// if (orgCount === 1) break
			if (orgCount % batchSize === 0 || orgCount === initialData.organization.size) {
				batchCounter++
				const message = `✍️ Writing batch ${batchCounter} of ${maxBatches} to file`
				log(message)
				task.output = message
				writeBatches(task)
			}
			// if (batchCounter === 1) break
		}
		const translationsOut = Object.fromEntries(translatedStrings)
		log(`🛠️ Generating translation JSON file (${translatedStrings.size} translations)`)
		fs.writeFileSync(`${generatedDir}es-migration.json`, JSON.stringify(translationsOut))

		log(`🛠️ Generating unsupported attribute JSON file (${unsupportedMap.size} attributes)`)
		const unsupportedAttOut = Object.fromEntries(unsupportedMap)
		fs.writeFileSync(`${generatedDir}unsupportedAttributes.json`, JSON.stringify(unsupportedAttOut))

		log(`✍️ Writing rollback file`)
		fs.writeFileSync(rollbackFile, superjson.stringify(rollback))

		for (const [key, value] of batchNameMap) {
			if (key && value) {
				log(`${value} generated: ${batchCount.get(key) ?? 0}`, 'gear')
			}
		}
	}

	return task.newListr([
		{
			title: 'Prepare maps',
			task: async (): Promise<void> => prepare(),
			options: {
				bottomBar: 20,
				// persistentOutput: false,
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
