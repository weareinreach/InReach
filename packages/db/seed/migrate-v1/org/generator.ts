import { Prisma, SourceType } from '@prisma/client'
import cuid from 'cuid'
import { flatten } from 'flat'
import fs from 'fs'
import parsePhoneNumber, { type PhoneNumber } from 'libphonenumber-js'
import { DateTime } from 'luxon'
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
	LanguageMap,
	generateKey,
	getCountryId,
	getGovDistId,
	getReferenceData,
	parseSchedule,
	serviceTagTranslation,
	uniqueSlug,
} from '~/seed/migrate-v1/org/lib'
import { tagCheck } from '~/seed/migrate-v1/org/lib/attributeHelpers'
import { createPoint } from '~/seed/migrate-v1/org/lib/createPoint'

export const orgDescTranslations: Prisma.TranslationKeyCreateManyInput[] = []
export const organizations: Prisma.OrganizationCreateManyInput[] = []

export const orgLocations: Prisma.OrgLocationCreateManyInput[] = []
export const translationKeys: Prisma.TranslationKeyCreateManyInput[] = []
export const orgPhones: Prisma.OrgPhoneCreateManyInput[] = []
export const orgEmails: Prisma.OrgEmailCreateManyInput[] = []
export const orgWebsites: Prisma.OrgWebsiteCreateManyInput[] = []
export const orgSocials: Prisma.OrgSocialMediaCreateManyInput[] = []
export const orgAPIConnections: Prisma.OutsideAPICreateManyInput[] = []
export const orgPhotos: Prisma.OrgPhotoCreateManyInput[] = []
export const orgHours: Prisma.OrgHoursCreateManyInput[] = []
export const orgServices: Prisma.OrgServiceCreateManyInput[] = []
export const serviceAccess: Prisma.ServiceAccessCreateManyInput[] = []
export const attributeRecords: Prisma.AttributeRecordCreateManyInput[] = []
export const attributeSupplements: Prisma.AttributeSupplementCreateManyInput[] = []
export const serviceAreas: Prisma.ServiceAreaUpsertArgs[] = []
export const serviceConnections: Prisma.OrgServiceUpdateArgs[] = []
export const orgConnections: Prisma.OrganizationUpdateArgs[] = []

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

const connect = (
	connections: string | { id: string }[] | undefined
): ConnectReturn<string | { id: string }[] | undefined> => {
	if (!connections) return undefined
	return Array.isArray(connections) ? { connect: connections } : { connect: { id: connections } }
}
const connectMulti = <T extends Record<string, unknown>[]>(connections: T): { connect: T } | undefined => {
	if (!connections.length) return undefined
	return { connect: connections }
}
const createMulti = <T extends Record<string, unknown>[]>(records: T): { create: T } | undefined => {
	if (!records.length) return undefined
	return { create: records }
}

export const translatedStrings = new Map<string, string>()
const exportTranslation = (key: string | undefined, translatedString: string | undefined): void => {
	if (key && translatedString) translatedStrings.set(key, translatedString)
}

export const migrateOrgs = async (task: ListrTask) => {
	const orgs: OrganizationsJSONCollection[] = JSON.parse(
		fs.readFileSync('./datastore/v1/mongodb/output/organizations.json', 'utf-8')
	)
	const log = (message: string) => {
		migrateLog.info(message)
		task.output = message
	}

	log(`🏗️ Upserting Source record.`)
	const sourceText = `migration` as string
	const { id: sourceId } = await prisma.source.upsert({
		where: { source: sourceText },
		create: { source: sourceText, type: 'SYSTEM' as SourceType },
		update: {},
		select: { id: true },
	})

	let countOrg = 0
	log(`🛠️ Generating Organization records...`)
	for (const org of orgs) {
		/* Slug generation */

		const primaryLocation = org.locations.find((location) => location.is_primary)
		const slug = await uniqueSlug(org.name, primaryLocation?.city, primaryLocation?.state)
		/* Description Translation Key */
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
			orgDescTranslations.push({
				key: descriptionKey,
				ns: descriptionNs,
				text: descriptionText,
			})
			exportTranslation(descriptionKey, org.description_ES)
		}

		organizations.push({
			name: org.name,
			slug,
			sourceId,
			descriptionKey,
			descriptionNs,
			createdAt: org.created_at.$date,
			updatedAt: org.updated_at.$date,
			published: org.is_published,
			deleted: org.is_deleted,
			legacyId: org._id.$oid,
			lastVerified: org.verified_at?.$date,
		})
		log(
			`🛠️ [${countOrg + 1}/${orgs.length}] Generated ${org.name}: Slug: ${isSuccess(
				slug
			)}, Description: ${isSuccess(descriptionKey && descriptionNs)}`
		)
		countOrg++
	}
	let translationRecordCount
	/* Create translation keys for descriptions */
	if (orgDescTranslations.length) {
		const results = await prisma.translationKey.createMany({
			data: orgDescTranslations,
			skipDuplicates: true,
		})
		translationRecordCount = results.count
		log(`🏗️ Translation Keys created: ${results.count}`)
	}
	/* Create Organization records */
	const orgResults = await prisma.organization.createMany({ data: organizations, skipDuplicates: true })
	log(`🏗️ Organization records created: ${orgResults.count}`)
	task.title = `Generate & create base organization records (${orgResults.count} organizations, ${
		translationRecordCount ?? 0
	} translation keys)`
}

export const generateRecords = async (task: ListrTask) => {
	const orgs: OrganizationsJSONCollection[] = JSON.parse(
		fs.readFileSync('./datastore/v1/mongodb/output/organizations.json', 'utf-8')
	)
	const log = (message: string) => {
		migrateLog.info(message)
		task.output = message
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

	/* Get all records & create a Map of legacyId -> id */
	const orgRecords = await prisma.organization.findMany({
		select: { id: true, legacyId: true, name: true, slug: true },
	})

	log(`🐕 Fetched ${orgRecords.length} Organization records.`)

	const orgIdMap = new Map<string, string>()
	const orgSlugMap = new Map<string, string>()

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

	/* Loop over orgs again to create supplemental records.*/
	log(`🛠️ Generating linked records...`)
	let orgCount = 0
	for (const org of orgs) {
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
				orgLocations.push({
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
					if (phoneData) break
				}
				const countryId = countryMap.get(phoneData?.country ?? 'US')
				if (!countryId) throw new Error('Unable to retrieve Country ID')
				const migrationReview = phoneData ? true : undefined
				const id = cuid()
				newPhoneMap.set(phone._id.$oid, id)
				orgPhones.push({
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
				countPhone++
			}
			log(`🛠️ Phone ${pluralRecord(org.phones)} for ${org.name}: ${countPhone} generated, ${skipLoc} skipped`)
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
				orgEmails.push({
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
				countEmail++
			}
			log(
				`🛠️ Email ${pluralRecord(org.emails)} for ${org.name}: ${countEmail} generated, ${skipEmail} skipped`
			)
		}

		/* Generate website records */
		if (!org.website && !org.website_ES) {
			log(`🤷 SKIPPING Website records for ${org.name}: No websites`)
		} else {
			let countWebsite = 0
			// eslint-disable-next-line prefer-const
			let count = countWebsite + 1
			const total = org.website && org.website_ES ? 2 : 1
			const sites =
				org.website && org.website_ES ? [org.website, org.website_ES] : [org.website ?? org.website_ES]
			log(`🛠️ Generating Website ${pluralRecord(sites)} for ${org.name}`)
			if (org.website) {
				log(`🛠️ [${count}/${total}] Website: ${org.website}`)
				orgWebsites.push({
					organizationId: orgId,
					url: org.website,
					createdAt,
					updatedAt,
				})
				countWebsite++
			}
			if (org.website_ES) {
				log(`🛠️ [${count}/${total}] Website: ${org.website_ES}`)
				const languageId = localeMap.get('es')
				orgWebsites.push({
					organizationId: orgId,
					url: org.website_ES,
					languageId,
					createdAt,
					updatedAt,
				})
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
				orgSocials.push({
					organizationId: orgId,
					serviceId,
					url: social.url,
					username,
					createdAt,
					updatedAt,
					legacyId: social._id.$oid,
				})
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
			log(`🤷 SKIPPING Photo records for ${org.name}: No profiles`)
		} else {
			let countPhoto = 0
			const skipPhoto = 0
			log(`🛠️ Generating Photo ${pluralRecord(org.photos)} for ${org.name}`)
			let apiCreated = false
			for (const photo of org.photos) {
				const count = countPhoto + skipPhoto + 1
				if (!apiCreated) {
					log(`🛠️ Generating Outside API Connection record for ${org.name}`)
					orgAPIConnections.push({
						serviceName: 'foursquare',
						apiIdentifier: photo.foursquare_vendor_id,
						createdAt,
						updatedAt,
					})
					apiCreated = true
				}
				log(`🛠️ [${count}/${org.photos.length}] Photo Record`)
				const { src, height, width } = photo
				orgPhotos.push({
					orgId,
					src,
					height: Math.round(height),
					width: Math.round(width),
				})
				countPhoto++
			}
			log(`🛠️ Outside API Connection record for ${org.name}: ${isSuccess(apiCreated)}`)
			log(
				`🛠️ Photo ${pluralRecord(org.photos)} for ${org.name}: ${countPhoto} generated, ${skipPhoto} skipped`
			)
		}

		/* Generate Hours records */
		if (!org.schedules.length) {
			log(`🤷 SKIPPING Hours records for ${org.name}: No schedules`)
		} else {
			let countHours = 0
			let skipHours = 0
			let totalRecordsGenerated = 0
			const needAssignment = org.locations.length < 1
			const helpers = { dayMap, hoursMap, hoursMeta }
			log(`🛠️ Generating Hours ${pluralRecord(org.schedules)} for ${org.name}`)

			for (const schedule of org.schedules) {
				const count = countHours + skipHours + 1
				const hours = parseSchedule(schedule, helpers)
				let recordsGenerated = 0
				if (!hours) {
					log(
						`🤷 [${count}/${org.schedules.length}] SKIPPING ${org.name} - ${schedule._id}: Unable to parse schedule.`
					)
					skipHours++
					continue
				}
				log(`🛠️ [${count}/${org.schedules.length}] Schedule: ${schedule.name ?? schedule._id.$oid}`)
				const newIds = new Set<string>()
				for (const [key, value] of Object.entries(hours)) {
					if (!value || !value.start || !value.end) continue
					const { start, end, closed, legacyId, legacyName, legacyNote, legacyTz, needReview } = value
					const id = cuid()
					newIds.add(id)
					orgHours.push({
						id,
						organizationId: orgId,
						dayIndex: parseInt(key),
						start: DateTime.fromFormat(start, 'HH:mm').toJSDate(),
						end: DateTime.fromFormat(end, 'HH:mm').toJSDate(),
						closed,
						legacyId,
						legacyName,
						legacyNote,
						legacyTz,
						needAssignment,
						needReview,
					})
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
						log(`🤷 Unsupported attribute: ${Object.keys(tagRecord.data).join()}`)
						unsupportedAttributes.push(tagRecord.data)
						break
					case 'attribute': {
						const { attribute: attrRecord, data: attrData } = tagRecord
						/* Checking the attribute record for the attribute type and then creating the attribute accordingly. */
						const attrBase = {
							attributeId: newAttrId,
							createdAt,
							updatedAt,
						}
						attributeRecords.push({
							id: newAttrId,
							attributeId: attrRecord.id,
							organizationId,
							createdAt,
							updatedAt,
						})
						switch (true) {
							case attrRecord.requireBoolean: {
								const boolean = attrData?.boolean
								if (!boolean) break
								log(`🛠️ Attribute boolean supplement: ${boolean}`)
								supplements++
								attributeSupplements.push({ ...attrBase, boolean })
								break
							}
							case attrRecord.requireLanguage: {
								const languageId = attrData?.language
								if (!languageId) break
								log(`🛠️ Attribute language supplement: Attached record ${attrData?.language}`)
								supplements++
								attributeSupplements.push({ ...attrBase, languageId })
								break
							}
							case attrRecord.requireText: {
								const text = attrData?.text
								if (!text || !orgSlug) break
								const suppId = cuid()
								const { key, ns, text: keyText } = generateKey({ type: 'attrSupp', orgSlug, suppId, text })
								if (!key || !ns || !keyText) break
								log(`🛠️ Attribute text supplement. Namespace: ${ns}, Key: ${key}, Text: ${keyText}`)
								supplements++
								translationKeys.push({ key, ns, text: keyText })
								attributeSupplements.push({ ...attrBase, id: suppId, textKey: key, textNs: ns })
								break
							}
						}
						break
					}
					case 'area': {
						// connect service area
						log(`🛠️ Service Area: ${tagRecord.attribute.name}`)
						servAreas++
						if (tagRecord.attribute.type === 'country') {
							serviceAreas.push({
								where: {
									organizationId,
								},
								create: {
									organization: {
										connect: { id: organizationId },
									},
									isNational: true,
									country: {
										connect: {
											id: tagRecord.attribute.id,
										},
									},
								},
								update: {},
							})
						}
						if (tagRecord.attribute.type === 'dist') {
							log(`🛠️ Service Area: ${tagRecord.attribute.name}`)
							servAreas++
							serviceAreas.push({
								where: {
									organizationId,
								},
								create: {
									organization: {
										connect: { id: organizationId },
									},
									areas: {
										connect: {
											id: tagRecord.attribute.id,
										},
									},
								},
								update: {},
							})
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
				attributeRecords.push({
					attributeId,
					organizationId,
					id: recordId,
					createdAt,
					updatedAt,
				})
				log(`🛠️ Attribute supplement- Unsupported items: ${unsupportedAttributes.length}`)
				attributeSupplements.push({
					attributeId: recordId,
					createdAt,
					updatedAt,
					data: JSON.stringify(unsupportedAttributes),
				})
			}

			log(
				`🛠️ Attribute ${pluralRecord(Object.keys(org.properties))} for ${org.name}: ${counter} ${
					counter === 1 ? 'Attribute' : 'Attributes'
				}, ${supplements} ${
					supplements === 1 ? 'Supplemental record' : 'Supplemental records'
				}, ${servAreas} ${servAreas === 1 ? 'Service area' : 'Service areas'}, $ ${
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
				const { key: descriptionKey, ns: descriptionNs } = generateKey({
					type: 'svc',
					subtype: 'desc',
					orgSlug,
					servId: serviceId,
					text: service.description,
				})
				exportTranslation(descriptionKey, service.description_ES)
				log(`🛠️ [${count}/${org.services.length}] Service: ${service.name}`)
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
					log(
						`\t🔑 [${accessCount + 1}/${service.access_instructions.length}] Service Access Instruction: ${
							access.instructions ?? access._id.$oid
						}`
					)
					const { key: textKey, ns: textNs } = generateKey({
						type: 'attrSupp',
						orgSlug,
						suppId: attributeSuppId,
						text: access.instructions,
					})
					exportTranslation(textKey, access.instructions_ES)

					attributeRecords.push({
						id: attributeRecordId,
						attributeId: attribute.id,
						serviceAccessId: accessId,
						createdAt,
						updatedAt,
					})
					attributeSupplements.push({
						id: attributeSuppId,
						attributeId: attributeRecordId,
						createdAt,
						updatedAt,
						textKey,
						textNs,
						data: JSON.stringify(access),
					})

					serviceAccess.push({
						serviceId,
						id: accessId,
						legacyId: access._id.$oid,
					})
					accessCount++
				}

				/* Basic Service Record*/
				orgServices.push({
					id: serviceId,
					descriptionKey,
					descriptionNs,
					createdAt,
					updatedAt,
					legacyId: service._id.$oid,
					legacyName: service.name,
					organizationId: orgId,
					published: service.is_published,
					deleted: service.is_deleted,
				})

				/* Generate Service Attributes */
				if (!service.properties || !Object.keys(service.properties).length) {
					log(`🤷 SKIPPING Attribute records for ${service.name}: No attributes attached to service`)
				} else {
					let counter = 0
					let skips = 0
					let supplements = 0
					let servAreas = 0
					const total = Object.keys(service.properties).length
					log(`🛠️ Generating Attribute ${pluralRecord(Object.keys(service.properties))} for ${service.name}`)
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
								log(`🤷 Unsupported attribute: ${Object.keys(tagRecord.data).join()}`)
								unsupportedAttributes.push(tagRecord.data)
								break
							case 'attribute': {
								const { attribute: attrRecord, data: attrData } = tagRecord
								/* Checking the attribute record for the attribute type and then creating the attribute accordingly. */
								const attrBase = {
									attributeId: newAttrId,
									createdAt,
									updatedAt,
								}
								attributeRecords.push({
									id: newAttrId,
									attributeId: attrRecord.id,
									organizationId,
									createdAt,
									updatedAt,
								})
								switch (true) {
									case attrRecord.requireBoolean: {
										const boolean = attrData?.boolean
										if (!boolean) break
										log(`🛠️ Attribute boolean supplement: ${boolean}`)
										supplements++
										attributeSupplements.push({ ...attrBase, boolean })
										break
									}
									case attrRecord.requireLanguage: {
										const languageId = attrData?.language
										if (!languageId) break
										log(`🛠️ Attribute language supplement: Attached record ${attrData?.language}`)
										supplements++
										attributeSupplements.push({ ...attrBase, languageId })
										break
									}
									case attrRecord.requireText: {
										const text = attrData?.text
										if (!text || !orgSlug) break
										const suppId = cuid()
										const {
											key,
											ns,
											text: keyText,
										} = generateKey({ type: 'attrSupp', orgSlug, suppId, text })
										if (!key || !ns || !keyText) break
										log(`🛠️ Attribute text supplement. Namespace: ${ns}, Key: ${key}, Text: ${keyText}`)
										supplements++
										translationKeys.push({ key, ns, text: keyText })
										attributeSupplements.push({ ...attrBase, id: suppId, textKey: key, textNs: ns })
										break
									}
								}
								break
							}
							case 'area': {
								// connect service area
								log(`🛠️ Service Area: ${tagRecord.attribute.name}`)
								servAreas++
								if (tagRecord.attribute.type === 'country') {
									serviceAreas.push({
										where: {
											orgServiceId: serviceId,
										},
										create: {
											orgService: {
												connect: { id: serviceId },
											},
											isNational: true,
											country: {
												connect: {
													id: tagRecord.attribute.id,
												},
											},
										},
										update: {},
									})
								}
								if (tagRecord.attribute.type === 'dist') {
									log(`🛠️ Service Area: ${tagRecord.attribute.name}`)
									servAreas++
									serviceAreas.push({
										where: {
											orgServiceId: serviceId,
										},
										create: {
											orgService: {
												connect: { id: serviceId },
											},
											areas: {
												connect: {
													id: tagRecord.attribute.id,
												},
											},
										},
										update: {},
									})
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
						attributeRecords.push({
							attributeId,
							organizationId,
							id: recordId,
							createdAt,
							updatedAt,
						})
						log(`🛠️ Attribute supplement- Unsupported items: ${unsupportedAttributes.length}`)
						attributeSupplements.push({
							attributeId: recordId,
							createdAt,
							updatedAt,
							data: JSON.stringify(unsupportedAttributes),
						})
					}

					log(
						`🛠️ Attribute ${pluralRecord(Object.keys(service.properties))} for ${service.name}: ${counter} ${
							counter === 1 ? 'Attribute' : 'Attributes'
						}, ${supplements} ${
							supplements === 1 ? 'Supplemental record' : 'Supplemental records'
						}, ${servAreas} ${servAreas === 1 ? 'Service area' : 'Service areas'}, $ ${
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
					let skips = 0
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
						skips++
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

				/* Connect to existing records, if they exist.*/
				const email = newEmailMap.get(service.email_id ?? '')
				const location = newLocationMap.get(service.location_id ?? '')
				const phone = newPhoneMap.get(service.phone_id ?? '')
				const schedule = newScheduleMap.get(service.schedule_id ?? '')

				log(
					`🔗 Generating link - Hours: ${isSuccess(schedule)}, Email: ${isSuccess(
						email
					)}, Location: ${isSuccess(location)}, Phone: ${isSuccess(phone)}`
				)
				serviceConnections.push({
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
				log(
					`🛠️ Generated ${service.name}: Access Info: ${isSuccess(accessCount)}, Description: ${isSuccess(
						descriptionKey && descriptionNs
					)}`
				)
				orgConnections.push({
					where: {
						id: orgId,
					},
					data: {
						associatedUsers: connectMulti(orgLinkedUsers),
						allowedEditors: createMulti(orgCreateEditors),
					},
				})
				counter++
			}
		}
		orgCount++
		task.title = `Generate supplemental organization records [${orgCount}/${orgs.length}]`
		if (orgCount === 10) break
	}
	const translationsOut = Object.fromEntries(translatedStrings)
	log(`🛠️ Generating translation JSON file (${translatedStrings.size} translations)`)
	fs.writeFileSync('es-migration.json', JSON.stringify(translationsOut))

	log(`Translation keys generated: ${translationKeys.length}`)
	log(`Organization locations generated: ${orgLocations.length}`)
	log(`Phone records generated: ${orgPhones.length}`)
	log(`Email records generated: ${orgEmails.length}`)
	log(`Website records generated: ${orgWebsites.length}`)
	log(`Social media records generated: ${orgSocials.length}`)
	log(`Outside API connection records generated: ${orgAPIConnections.length}`)
	log(`Organization photo records generated: ${orgPhotos.length}`)
	log(`Operating hours records generated: ${orgHours.length}`)
	log(`Service records generated: ${orgServices.length}`)
	log(`Service access records generated: ${serviceAccess.length}`)
	log(`Attribute records generated: ${attributeRecords.length}`)
	log(`Attribute supplements generated: ${attributeSupplements.length}`)
	log(`Service area records generated: ${serviceAreas.length}`)
	log(`Service link updates generated: ${serviceConnections.length}`)
	log(`Organization link updates generated: ${orgConnections.length}`)
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
