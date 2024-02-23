/* eslint-disable node/no-process-env */
import compact from 'just-compact'
import { isSupportedCountry, parsePhoneNumberWithError } from 'libphonenumber-js'
import superjson from 'superjson'

import fs from 'fs'
import path from 'path'

import { socialParser } from '@weareinreach/util/social-parser'
import { type Prisma, prisma } from '~db/client'
import { generateNestedFreeText, generateNestedFreeTextUpsert } from '~db/lib/generateFreeText'
import { generateId, isIdFor } from '~db/lib/idGen'
import { generateUniqueSlug } from '~db/lib/slugGen'
import { JsonInputOrNull, accessInstructions as zAccessInstructions } from '~db/zod_util'

import { DataFile, JoinFile } from './!schemas'

const rawData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '!load.json'), 'utf8'))
const rawJoins = JSON.parse(fs.readFileSync(path.resolve(__dirname, '!joins.json'), 'utf8'))

const parsedData = DataFile.safeParse(rawData)
const parsedJoins = JoinFile.safeParse(rawJoins)

export interface Output {
	records: {
		organization: Prisma.OrganizationUpsertArgs
		orgLocation: Prisma.OrgLocationUpsertArgs[]
		orgEmail: Prisma.OrgEmailUpsertArgs[]
		orgPhone: Prisma.OrgPhoneUpsertArgs[]
		orgService: Prisma.OrgServiceUpsertArgs[]
	}[]

	handledSuggestions: Prisma.SuggestionUpdateManyArgs
}

const handledSuggestions: string[] = []

const output: Output = {
	records: [],
	handledSuggestions: {
		where: { organizationId: { in: handledSuggestions } },
		data: { handled: true },
	},
}
const orgAttributes = [
	'asylum-seekers',
	'bipoc-comm',
	'bipoc-led',
	'black-led',
	'gender-nc',
	'hiv-comm',
	'immigrant-comm',
	'immigrant-led',
	'lgbtq-youth-focus',
	'resettled-refugees',
	'spanish-speakers',
	'trans-comm',
	'trans-fem',
	'trans-led',
	'trans-masc',
	'trans-youth-focus',
]
const activeCountries = ['UM', 'US', 'MH', 'PW', 'AS', 'MX', 'CA', 'MP', 'GU', 'PR', 'VI']

const attributes = {
	alertMessage: 'attr_01GYSVX1NAMR6RDV6M69H4KN3T',
	serviceAccess: {
		email: 'attr_01GW2HHFVKFM4TDY4QRK4AR2ZW',
		phone: 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0',
		file: 'attr_01GW2HHFVKMRHFD8SMDAZM3SSM',
		link: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
	},
	'at-capacity': 'attr_01GW2HHFV3YJ2AWADHVKG79BQ0',
	'cost-fees': 'attr_01GW2HHFVGWKWB53HWAAHQ9AAZ',
	'cost-free': 'attr_01GW2HHFVGDTNW9PDQNXK6TF1T',
	'elig-age-min': 'attr_01GW2HHFVGSAZXGR4JAVHEK6ZC',
	'elig-age-max': 'attr_01GW2HHFVGSAZXGR4JAVHEK6ZC',
	'has-confidentiality-policy': 'attr_01GW2HHFV3BADK80TG0DXXFPMM',
	'lang-offered': 'attr_01GW2HHFVJ8K180CNX339BTXM2',
	'offers-remote-services': 'attr_01GW2HHFV5Q7XN2ZNTYFR1AD3M',
	'other-describe': 'attr_01GW2HHFVJDKVF1HV7559CNZCY',
	'req-medical-insurance': 'attr_01GW2HHFVH9DPBZ968VXGE50E7',
	'req-photo-id': 'attr_01GW2HHFVHZ599M48CMSPGDCSC',
	'req-proof-of-age': 'attr_01GW2HHFVH0GQK0GAJR5D952V3',
	'req-proof-of-income': 'attr_01GW2HHFVHEVX4PMNN077ASQMG',
	'req-referral': 'attr_01GW2HHFVJH8MADHYTHBV54CER',
}

const serviceAttributes = {
	boolean: [
		'at-capacity',
		'cost-free',
		'has-confidentiality-policy',
		'offers-remote-services',
		'req-medical-insurance',
		'req-photo-id',
		'req-proof-of-age',
		'req-proof-of-income',
		'req-referral',
	],
	cost: ['cost-fees'],
	age: ['elig-age-max', 'elig-age-min'],
	languages: ['lang-offered'],
	text: ['other-describe'],
	all: [
		'at-capacity',
		'cost-free',
		'has-confidentiality-policy',
		'offers-remote-services',
		'req-medical-insurance',
		'req-photo-id',
		'req-proof-of-age',
		'req-proof-of-income',
		'req-referral',
		'cost-fees',
		'elig-age-max',
		'elig-age-min',
		'lang-offered',
		'other-describe',
	],
} as const
const zServAccess = zAccessInstructions.getAll()
const prep = async () => {
	const attributes = await prisma.attribute.findMany({ select: { id: true, tag: true } })
	const attributeMap = new Map(attributes.map(({ id, tag }) => [tag, id]))
	const countries = await prisma.country.findMany({ select: { id: true, cca2: true } })
	const countryMap = new Map(countries.map(({ cca2, id }) => [id, cca2]))
	const govDist = await prisma.govDist.findMany({
		select: { id: true, abbrev: true },
		where: { isPrimary: true },
	})
	const govDistMap = new Map(govDist.map(({ abbrev, id }) => [id, abbrev]))
	const existingOrgs = await prisma.organization.findMany()
	const orgMap = new Map(existingOrgs.map(({ id, ...rest }) => [id, rest]))
	const existingLocations = await prisma.orgLocation.findMany({ include: { serviceAreas: true } })
	const locationMap = new Map(existingLocations.map(({ id, ...rest }) => [id, rest]))
	const geoCache = new Map<string, { lat: number; lon: number }>()
	if (fs.existsSync(path.resolve(__dirname, '!geocache.json'))) {
		const cacheData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '!geocache.json'), 'utf8')) as [
			string,
			{ lat: number; lon: number },
		][]
		if (Array.isArray(cacheData)) {
			for (const [id, loc] of cacheData) {
				geoCache.set(id, loc)
			}
			console.log(geoCache.size)
		}
	}

	const socialMediaServices = await prisma.socialMediaService.findMany({ select: { id: true, name: true } })
	const socialMediaMap = new Map(socialMediaServices.map(({ name, id }) => [name.toLowerCase(), id]))

	return { attributeMap, countryMap, govDistMap, orgMap, locationMap, geoCache, socialMediaMap }
}

function throttleApiCalls<T>(fn: () => Promise<T>): () => Promise<T> {
	let count = 0
	const interval = 1000 // 1 second

	return async function apiCall() {
		if (count >= 5) {
			await new Promise((resolve) => setTimeout(resolve, interval))
			count = 0
		}

		count++
		return await fn()
	}
}

const run = async () => {
	const { attributeMap, countryMap, govDistMap, orgMap, locationMap, geoCache, socialMediaMap } = await prep()
	if (!parsedData.success || !parsedJoins.success) {
		if (!parsedData.success) console.error(parsedData.error.format())
		if (!parsedJoins.success) console.error(parsedJoins.error.format())
		return
	}
	const data = parsedData.data
	const joins = parsedJoins.data

	const idMap = new Map<string, string>()

	for (const org of data.organization) {
		if (org['reviewed?'] !== true) {
			console.info(`Skipping ${org.Name} (${org.id}) --> Not ready for upload`)
			continue
		}
		const existingOrgRecord = orgMap.get(org.id)

		const isNew = !isIdFor('organization', org.id) || !existingOrgRecord
		const orgId = isNew ? generateId('organization') : org.id
		console.info(`Processing ${org.id} -- ${org.Name}`)
		if (!isNew) {
			handledSuggestions.push(orgId)
		}
		idMap.set(org.id, orgId)

		const orgData: Prisma.OrganizationUpsertArgs['create'] = {
			name: org.Name.trim(),
			slug: existingOrgRecord?.slug ?? (await generateUniqueSlug({ name: org.Name.trim(), id: orgId })),
			source: { connect: { id: 'srce_01GXD88N4X2XNE3DW0G1AZJ403' } },
			lastVerified: new Date(),
			published: true,
		} as const

		const record: Output['records'][number] = {
			organization: {
				where: { id: orgId },
				create: { id: orgId, ...orgData },
				update: orgData,
			},
			orgLocation: [],
			orgEmail: [],
			orgPhone: [],
			orgService: [],
		}
		const organizationAttributes: OrganizationAttributes = {
			connectOrCreate: [],
			upsert: [],
		}

		if (org.Description) {
			const descriptionId = existingOrgRecord?.descriptionId ?? generateId('freeText')
			const generateFreetextArgs = {
				orgId,
				text: org.Description.trim(),
				type: 'orgDesc',
				freeTextId: descriptionId,
			} as const
			record.organization.create.description = generateNestedFreeText(generateFreetextArgs)
			record.organization.update.description = generateNestedFreeTextUpsert(generateFreetextArgs)
		}
		if (org['Alert Message']) {
			const existingAlert = await prisma.attributeSupplement.findFirst({
				where: { attributeId: attributes.alertMessage, organizationId: orgId },
			})
			const supplementId = existingAlert?.id ?? generateId('attributeSupplement')
			const alertMessageArgs = {
				orgId,
				text: org['Alert Message'].trim(),
				type: 'attSupp',
				itemId: supplementId,
			} as const
			organizationAttributes.connectOrCreate.push({
				where: { id: supplementId },
				create: {
					id: supplementId,
					attribute: { connect: { id: attributes.alertMessage } },
					text: generateNestedFreeText(alertMessageArgs),
				},
			})
			organizationAttributes.upsert.push({
				where: { id: supplementId },
				update: { text: generateNestedFreeTextUpsert(alertMessageArgs) },
				create: {
					attribute: { connect: { id: attributes.alertMessage } },
					text: generateNestedFreeText(alertMessageArgs),
				},
			})
		}
		for (const attrib of orgAttributes) {
			if (org[attrib]) {
				const attributeId = attributeMap.get(attrib)
				if (!attributeId) continue
				const existingAttrib = await prisma.attributeSupplement.findFirst({
					where: { attributeId, organizationId: orgId },
				})
				const id = existingAttrib?.id ?? generateId('attributeSupplement')
				const connectOrCreateArgs = { where: { id }, create: { id, attributeId } } as const
				organizationAttributes.connectOrCreate.push(connectOrCreateArgs)
				organizationAttributes.upsert.push({
					...connectOrCreateArgs,
					update: {},
				})
			}
		}

		if (org.URL) {
			const existingWebsite = await prisma.orgWebsite.findFirst({
				where: { organizationId: orgId },
			})
			const id = existingWebsite?.id ?? generateId('orgWebsite')
			record.organization.create.websites = {
				create: { url: org.URL, id: generateId('orgWebsite') },
			}
			record.organization.update.websites = {
				upsert: { where: { id }, create: { id, url: org.URL }, update: { url: org.URL } },
			}
		}
		const socialMedias = data.orgSocial.filter(({ organizationId }) => organizationId === org.id)
		if (socialMedias.length) {
			record.organization.create.socialMedia = {
				createMany: {
					data: compact(
						socialMedias.map(({ id, url, ...rest }) => {
							const smId = isIdFor('orgSocialMedia', id) ? id : generateId('orgSocialMedia')
							const service = socialParser.detectProfile(url)
							if (!service) {
								return
							}
							const username = socialParser.getProfileId(service, url)
							const sanitizedUrl = socialParser.sanitize(service, url)
							const serviceId = socialMediaMap.get(service)
							if (!serviceId) {
								throw new Error(`Social media service ${service} not found`)
							}
							return { id: smId, serviceId, url: sanitizedUrl, username, legacyId: id, published: true }
						})
					),
					skipDuplicates: true,
				},
			}
			record.organization.update.socialMedia = {
				upsert: compact(
					socialMedias.map(({ id, url, ...rest }) => {
						const smId = isIdFor('orgSocialMedia', id) ? id : generateId('orgSocialMedia')
						const service = socialParser.detectProfile(url)
						if (!service) {
							return
						}
						const username = socialParser.getProfileId(service, url)
						const serviceId = socialMediaMap.get(service)
						const sanitizedUrl = socialParser.sanitize(service, url)
						if (!serviceId) {
							throw new Error(`Social media service ${service} not found`)
						}
						return {
							where: { id: smId },
							create: {
								id: smId,
								legacyId: id,
								serviceId,
								url: sanitizedUrl,
								username,
								published: true,
							},
							update: {
								legacyId: id,
								serviceId,
								url: sanitizedUrl,
								username,
								published: true,
							},
						}
					})
				),
			}
		}
		const locations = data.orgLocation.filter(({ organizationId }) => organizationId === org.id)
		const locationIds = locations.map(({ id }) => id)

		const services = data.orgService.filter(({ organizationId }) => organizationId === org.id)
		const serviceIds = services.map(({ id }) => id)

		const emailIdsToProcess = [
			...new Set(
				joins.orgLocationEmail
					.filter(({ locationId }) => locationIds.includes(locationId))
					.map(({ emailId }) => emailId)
					.concat(
						joins.orgServiceEmail
							.filter(({ serviceId }) => serviceIds.includes(serviceId))
							.map(({ emailId }) => emailId)
					)
			),
		]
		const phoneIdsToProcess = [
			...new Set(
				joins.orgLocationPhone
					.filter(({ locationId }) => locationIds.includes(locationId))
					.map(({ phoneId }) => phoneId)
					.concat(
						joins.orgServicePhone
							.filter(({ serviceId }) => serviceIds.includes(serviceId))
							.map(({ phoneId }) => phoneId)
					)
			),
		]
		const serviceIdsToProcess = [
			...new Set(
				joins.orgLocationService
					.filter(({ locationId }) => locationIds.includes(locationId))
					.map(({ serviceId }) => serviceId)
			),
		]
		for (const legacyId of emailIdsToProcess) {
			const email = data.orgEmail.find(({ id }) => id === legacyId)
			if (!email) {
				console.error(`Cannot locate email record ${legacyId}`)
				continue
			}
			const existingRecord = await prisma.orgEmail.findFirst({
				where: { OR: [{ id: email.id }, { legacyId: email.id }] },
			})
			const emailId = isIdFor('orgEmail', email.id) ? email.id : existingRecord?.id ?? generateId('orgEmail')
			idMap.set(legacyId, emailId)
			const emailDescArgs = {
				orgId,
				type: 'emailDesc',
				itemId: emailId,
				text: email.description!,
				freeTextId: existingRecord?.descriptionId,
			} as const
			record.orgEmail.push({
				where: { id: emailId },
				create: {
					id: emailId,
					legacyId,
					email: email.email,
					description: email.description ? generateNestedFreeText(emailDescArgs) : undefined,
				},
				update: {
					legacyId,
					email: email.email,
					description: email.description ? generateNestedFreeTextUpsert(emailDescArgs) : undefined,
				},
			})
		}
		for (const legacyId of phoneIdsToProcess) {
			const phone = data.orgPhone.find(({ id }) => id === legacyId)
			if (!phone) {
				console.error(`Cannot locate phone record ${legacyId}`)
				continue
			}
			const existingRecord = await prisma.orgPhone.findFirst({
				where: { OR: [{ id: phone.id }, { legacyId: phone.id }] },
			})
			const phoneId = isIdFor('orgPhone', phone.id) ? phone.id : existingRecord?.id ?? generateId('orgPhone')
			idMap.set(legacyId, phoneId)
			const phoneDescArgs = {
				orgId,
				type: 'phoneDesc',
				itemId: phoneId,
				text: phone.description,
				freeTextId: existingRecord?.descriptionId,
			} as const
			const locationLinkCandidate = data.orgLocation.find(({ id }) => {
				const { locationId } = joins.orgLocationPhone.find(({ phoneId }) => phoneId === phone.id) ?? {}
				return locationId === id
			})

			const cca2val = locationLinkCandidate?.Country ?? 'US'
			const countrycode = isSupportedCountry(cca2val) ? cca2val : 'US'
			const parsedPhone = parsePhoneNumberWithError(
				compact([phone.number, phone.ext]).join(' ').trim(),
				countrycode
			)
			record.orgPhone.push({
				where: { id: phoneId },
				create: {
					id: phoneId,
					legacyId,
					number: parsedPhone.nationalNumber,
					ext: parsedPhone.ext,
					country: { connect: { cca2: countrycode } },
					description: phone.description ? generateNestedFreeText(phoneDescArgs) : undefined,
				},
				update: {
					legacyId,
					number: parsedPhone.nationalNumber,
					ext: parsedPhone.ext,
					country: { connect: { cca2: countrycode } },
					description: phone.description ? generateNestedFreeTextUpsert(phoneDescArgs) : undefined,
				},
			})
		}
		for (const legacyId of serviceIdsToProcess) {
			const service = data.orgService.find(({ id }) => id === legacyId)
			if (!service) {
				console.error(`Cannot locate service record ${legacyId}`)
				continue
			}
			const existingRecord = await prisma.orgService.findFirst({
				where: { OR: [{ id: service.id }, { legacyId: service.id }] },
			})
			const serviceId = isIdFor('orgService', service.id)
				? service.id
				: existingRecord?.id ?? generateId('orgService')
			idMap.set(legacyId, serviceId)
			const serviceNameArgs = {
				orgId,
				type: 'svcName',
				itemId: serviceId,
				text: service.Title,
				freeTextId: existingRecord?.serviceNameId,
			} as const
			const serviceDescArgs = {
				orgId,
				type: 'svcDesc',
				itemId: serviceId,
				text: service.Description,
				freeTextId: existingRecord?.descriptionId,
			} as const

			const generateAttribRecords = async (): Promise<{
				create: Prisma.AttributeSupplementCreateNestedManyWithoutServiceInput
				update: Prisma.AttributeSupplementUpdateManyWithoutServiceNestedInput
			}> => {
				const connectOrCreate: Prisma.AttributeSupplementCreateNestedManyWithoutServiceInput['connectOrCreate'] =
					[]
				const upsert: Prisma.AttributeSupplementUpdateManyWithoutServiceNestedInput['upsert'] = []

				for (const tag of serviceAttributes.all) {
					if (Object.keys(service).includes(tag) && service[tag]) {
						const attributeId = attributes[tag]
						if (!attributeId) throw new Error(`Unknown attribute -> ${tag}`)

						const existingRecord = await prisma.attributeSupplement.findFirst({
							where: {
								attributeId,
								serviceId,
							},
						})
						const supplementId = existingRecord?.id ?? generateId('attributeSupplement')
						const where = { id: supplementId }

						switch (tag) {
							case 'other-describe':
							case 'cost-fees': {
								const content = service[tag]
								if (typeof content !== 'string') break
								const freeTextArgs = {
									orgId,
									type: 'attSupp',
									itemId: supplementId,
									text: content,
									freeTextId: existingRecord?.textId,
								} as const

								const create = {
									id: supplementId,
									attribute: { connect: { id: attributeId } },
									text: generateNestedFreeText(freeTextArgs),
								}
								connectOrCreate.push({
									where,
									create,
								})
								upsert.push({
									where,
									create,
									update: {
										text: generateNestedFreeTextUpsert(freeTextArgs),
									},
								})
								break
							}
							case 'elig-age-max':
							case 'elig-age-min': {
								const data = JsonInputOrNull.parse(
									superjson.serialize({
										...(service['elig-age-min'] ? { min: service['elig-age-min'] } : {}),
										...(service['elig-age-max'] ? { max: service['elig-age-max'] } : {}),
									})
								)
								const create = {
									id: supplementId,
									attribute: { connect: { id: attributeId } },
									data,
								}
								connectOrCreate.push({
									where,
									create,
								})
								upsert.push({
									where,
									create,
									update: {
										data,
									},
								})

								break
							}
							case 'lang-offered': {
								if (!service['lang-offered']) break
								const langs = service['lang-offered']
								for (const langId of langs) {
									const create = {
										id: supplementId,
										attribute: { connect: { id: attributeId } },
										language: { connect: { id: langId } },
									}
									connectOrCreate.push({
										where,
										create,
									})
									upsert.push({
										where,
										create,
										update: {
											language: { connect: { id: langId } },
										},
									})
								}
								break
							}
							default: {
								const create = {
									id: supplementId,
									attribute: { connect: { id: attributeId } },
								}
								connectOrCreate.push({
									where,
									create,
								})
								upsert.push({
									where,
									create,
									update: {
										attribute: { connect: { id: attributeId } },
									},
								})
							}
						}
					}
				}
				const serviceAccessToAdd = data.svcAccess.filter(({ serviceId }) => serviceId === service.id)
				for (const { type: accessType, value } of serviceAccessToAdd) {
					if (accessType === '') continue
					const attributeId = attributes.serviceAccess[accessType]
					const existingRecord = await prisma.attributeSupplement.findFirst({
						where: {
							attributeId,
							serviceId,
						},
					})
					const supplementId = existingRecord?.id ?? generateId('attributeSupplement')
					const where = { id: supplementId }
					const data = JsonInputOrNull.parse(
						superjson.serialize(
							zServAccess.parse({
								access_type: accessType,
								access_value: value,
							})
						)
					)
					const create = {
						id: supplementId,
						attribute: { connect: { id: attributeId } },
						data,
					}
					connectOrCreate.push({
						where,
						create,
					})
					upsert.push({
						where,
						create,
						update: {
							attribute: { connect: { id: attributeId } },
							data,
						},
					})
				}
				return {
					create: { connectOrCreate },
					update: { upsert },
				}
			}
			const attributeRecords = await generateAttribRecords()
			const servicePhones = compact(
				joins.orgServicePhone
					.filter(({ serviceId }) => serviceId === service.id)
					.map(({ phoneId }) => idMap.get(phoneId))
			)
			const serviceEmails = compact(
				joins.orgServiceEmail
					.filter(({ serviceId }) => serviceId === service.id)
					.map(({ emailId }) => idMap.get(emailId))
			)

			record.orgService.push({
				where: { id: serviceId },
				create: {
					id: serviceId,
					legacyId,
					serviceName: generateNestedFreeText(serviceNameArgs),
					description: generateNestedFreeText(serviceDescArgs),
					organization: { connect: { id: orgId } },
					published: true,
					services: service['Tag(s)']?.length
						? { createMany: { data: service['Tag(s)']?.map(({ tag: tagId }) => ({ tagId })) } }
						: undefined,
					attributes: attributeRecords.create,
					emails: {
						connectOrCreate: serviceEmails.map((orgEmailId) => ({
							where: { orgEmailId_serviceId: { orgEmailId, serviceId } },
							create: { orgEmailId },
						})),
					},
					phones: {
						connectOrCreate: servicePhones.map((orgPhoneId) => ({
							where: { orgPhoneId_serviceId: { orgPhoneId, serviceId } },
							create: { orgPhoneId },
						})),
					},
				},
				update: {
					legacyId,
					serviceName: generateNestedFreeTextUpsert(serviceNameArgs),
					description: generateNestedFreeTextUpsert(serviceDescArgs),
					organization: { connect: { id: orgId } },
					published: true,
					services: service['Tag(s)']?.length
						? {
								upsert: service['Tag(s)'].map(({ tag: tagId }) => ({
									where: { serviceId_tagId: { serviceId, tagId } },
									create: { tagId },
									update: { tagId },
								})),
							}
						: undefined,
					emails: {
						connectOrCreate: serviceEmails.map((orgEmailId) => ({
							where: { orgEmailId_serviceId: { orgEmailId, serviceId } },
							create: { orgEmailId },
						})),
					},
					phones: {
						connectOrCreate: servicePhones.map((orgPhoneId) => ({
							where: { orgPhoneId_serviceId: { orgPhoneId, serviceId } },
							create: { orgPhoneId },
						})),
					},
					attributes: attributeRecords.update,
				},
			})
		}

		for (const loc of locations) {
			const existingLocationRecord = locationMap.get(loc.id)
			const orgLocationId = isIdFor('orgLocation', loc.id) ? loc.id : generateId('orgLocation')

			const locationEmails = compact(
				joins.orgLocationEmail
					.filter(({ locationId }) => locationId === loc.id)
					.map(({ emailId }) => idMap.get(emailId))
			)
			const locationPhones = compact(
				joins.orgLocationPhone
					.filter(({ locationId }) => locationId === loc.id)
					.map(({ phoneId }) => idMap.get(phoneId))
			)
			const locationServices = compact(
				joins.orgLocationService
					.filter(({ locationId }) => locationId === loc.id)
					.map(({ serviceId }) => idMap.get(serviceId))
			)

			const locDataCreate: Prisma.OrgLocationUpsertArgs['create'] = {
				id: orgLocationId,
				orgId,
				name: loc['Location Name'].trim(),
				street1: loc.Street,
				city: loc.City?.trim() ?? '',
				countryId: loc.Country,
				govDistId: loc.State,
				postCode: loc.PostalCode,
				notVisitable: loc['Hide Location?'],
				mapCityOnly: loc['Hide Location?'],
				phones: {
					connectOrCreate: locationPhones.map((phoneId) => ({
						where: { orgLocationId_phoneId: { orgLocationId, phoneId } },
						create: { phoneId },
					})),
				},
				emails: {
					connectOrCreate: locationEmails.map((orgEmailId) => ({
						where: { orgEmailId_orgLocationId: { orgEmailId, orgLocationId } },
						create: { orgEmailId },
					})),
				},
				services: {
					connectOrCreate: locationServices.map((serviceId) => ({
						where: { orgLocationId_serviceId: { orgLocationId, serviceId } },
						create: { serviceId },
					})),
				},
			}
			const locDataUpdate: Prisma.OrgLocationUpsertArgs['update'] = {
				...locDataCreate,
				id: undefined,
			}

			const cca2 = countryMap.get(loc.Country)
			const govDistAbbrev = govDistMap.get(loc.State ?? '')
			if (loc.City && cca2) {
				const searchString = compact([
					locDataCreate.street1,
					locDataCreate.city,
					govDistAbbrev,
					locDataCreate.postCode,
					cca2,
				]).join(', ')

				const searchParams = new URLSearchParams({
					text: searchString,
					format: 'json',
					apiKey: process.env.GEOAPIFY_API_KEY as string,
					filter: `countrycode:${activeCountries.join(',').toLowerCase()}`,
				}).toString()
				const cachedResult = geoCache.get(searchParams)
				if (cachedResult?.lat && cachedResult?.lon) {
					locDataCreate.latitude = cachedResult.lat
					locDataCreate.longitude = cachedResult.lon
					locDataUpdate.latitude = cachedResult.lat
					locDataUpdate.longitude = cachedResult.lon
				} else {
					const geoURL = `https://api.geoapify.com/v1/geocode/search?${searchParams}`
					const geoResponse = await throttleApiCalls(async () => await fetch(geoURL))()
					const geoData = await geoResponse.json()
					const geoResult = geoData.results.length ? geoData.results[0] : null
					locDataCreate.latitude = geoResult?.lat
					locDataCreate.longitude = geoResult?.lon
					locDataUpdate.latitude = geoResult?.lat
					locDataUpdate.longitude = geoResult?.lon
					if (geoResult?.lat && geoResult?.lon) {
						geoCache.set(searchParams, { lat: geoResult.lat, lon: geoResult.lon })
					}
				}

				if (loc['Service Area Coverage - State(s)'] || loc['Service Area Coverage - USA National']) {
					const serviceAreaId = existingLocationRecord?.serviceAreas?.id ?? generateId('serviceArea')

					const countriesToAttach = (loc['Service Area Coverage - USA National'] ?? []).map((country) => ({
						countryId: country.trim(),
					}))
					const govDistsToAttach = (loc['Service Area Coverage - State(s)'] ?? []).map((govDist) => ({
						govDistId: govDist.trim(),
					}))
					const serviceAreaCreate = {
						create: {
							id: serviceAreaId,
							countries: {
								createMany: {
									data: countriesToAttach,
									skipDuplicates: true,
								},
							},
							districts: {
								createMany: {
									data: govDistsToAttach,
									skipDuplicates: true,
								},
							},
						},
					} as const
					locDataCreate.serviceAreas = serviceAreaCreate
					locDataUpdate.serviceAreas = {
						upsert: {
							create: serviceAreaCreate.create,
							update: {
								countries: {
									set: countriesToAttach.map(({ countryId }) => ({
										serviceAreaId_countryId: { countryId, serviceAreaId },
									})),
								},
								districts: {
									set: govDistsToAttach.map(({ govDistId }) => ({
										serviceAreaId_govDistId: { govDistId, serviceAreaId },
									})),
								},
							},
						},
					}
				}
			}

			const orgLocationRecord: Prisma.OrgLocationUpsertArgs = {
				where: { id: orgLocationId },
				create: locDataCreate,
				update: locDataUpdate,
			}
			record.orgLocation.push(orgLocationRecord)
		}
		output.records.push(record)
	}
	console.log(geoCache.size)
	fs.writeFileSync(path.resolve(__dirname, '!geocache.json'), JSON.stringify([...geoCache.entries()]))
	fs.writeFileSync(path.resolve(__dirname, '!data.json'), JSON.stringify(output))
}

run()

type OrganizationAttributes = {
	connectOrCreate: Prisma.AttributeSupplementCreateOrConnectWithoutOrganizationInput[]
	upsert: Prisma.AttributeSupplementUpsertWithWhereUniqueWithoutOrganizationInput[]
}
