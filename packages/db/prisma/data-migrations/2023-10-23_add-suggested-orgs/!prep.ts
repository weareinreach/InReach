/* eslint-disable node/no-process-env */
import compact from 'just-compact'
import { isSupportedCountry, parsePhoneNumberWithError } from 'libphonenumber-js'
import superjson from 'superjson'

import fs from 'fs'
import path from 'path'

import { Prisma, prisma } from '~db/client'
import { generateFreeText } from '~db/lib/generateFreeText'
import { generateId, isIdFor } from '~db/lib/idGen'
import { generateUniqueSlug } from '~db/lib/slugGen'
import { JsonInputOrNull } from '~db/zod_util'

import { DataFile, DataSchema, JoinFile, JoinSchema } from './!schemas'

const data = DataFile.parse(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data.json'), 'utf8')))
const joins = JoinFile.parse(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'joins.json'), 'utf8')))

export interface Output {
	organizationNew: Prisma.OrganizationCreateManyInput[]
	organizationUp: Prisma.OrganizationUpdateArgs[]
	organizationAttribute: Prisma.OrganizationAttributeCreateManyInput[]
	attributeSupplement: Prisma.AttributeSupplementCreateManyInput[]
	translationKey: Prisma.TranslationKeyCreateManyInput[]
	freeText: Prisma.FreeTextCreateManyInput[]
	orgLocation: Prisma.OrgLocationCreateManyInput[]
	serviceArea: Prisma.ServiceAreaCreateManyInput[]
	serviceAreaCountry: Prisma.ServiceAreaCountryCreateManyInput[]
	serviceAreaDist: Prisma.ServiceAreaDistCreateManyInput[]
	orgService: Prisma.OrgServiceCreateManyInput[]
	orgServiceTag: Prisma.OrgServiceTagCreateManyInput[]
	orgEmail: Prisma.OrgEmailCreateManyInput[]
	orgPhone: Prisma.OrgPhoneCreateManyInput[]
	orgServiceEmail: Prisma.OrgServiceEmailCreateManyInput[]
	orgServicePhone: Prisma.OrgServicePhoneCreateManyInput[]
	orgLocationEmail: Prisma.OrgLocationEmailCreateManyInput[]
	orgLocationPhone: Prisma.OrgLocationPhoneCreateManyInput[]
	orgLocationService: Prisma.OrgLocationServiceCreateManyInput[]
	serviceAccessAttribute: Prisma.ServiceAccessAttributeCreateManyInput[]
	serviceAttribute: Prisma.ServiceAttributeCreateManyInput[]
	handledSuggestions: Prisma.SuggestionUpdateManyArgs
}

const handledSuggestions: string[] = []

const output: Output = {
	translationKey: [],
	freeText: [],

	organizationNew: [],
	organizationUp: [],

	orgLocation: [],
	orgService: [],
	orgEmail: [],
	orgPhone: [],

	attributeSupplement: [],

	serviceArea: [],
	serviceAreaCountry: [],
	serviceAreaDist: [],

	orgServiceTag: [],

	organizationAttribute: [],
	serviceAccessAttribute: [],
	serviceAttribute: [],

	orgServiceEmail: [],
	orgServicePhone: [],
	orgLocationEmail: [],
	orgLocationPhone: [],
	orgLocationService: [],
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

	return { attributeMap, countryMap, govDistMap }
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
	const { attributeMap, countryMap, govDistMap } = await prep()
	for (const org of data.organization) {
		const isNew = !isIdFor('organization', org.id)
		const orgId = isNew ? generateId('organization') : org.id
		if (!org['reviewed?']) {
			console.info(`Skipping ${org['Name ']} (${org.id}) --> Not ready for upload`)
			continue
		}
		console.info(`Processing ${org.id} -- ${org['Name ']}`)
		if (!isNew) {
			handledSuggestions.push(orgId)
		}
		const orgData: Prisma.OrganizationUncheckedUpdateInput | Prisma.OrganizationCreateManyInput = {}
		orgData.name = org['Name '].trim()
		orgData.slug = await generateUniqueSlug({ name: orgData.name, id: orgId })
		orgData.sourceId = 'srce_01GXD88N4X2XNE3DW0G1AZJ403'
		orgData.lastVerified = new Date()

		if (org['Description ']) {
			const desc = generateFreeText({ orgId, text: org['Description '].trim(), type: 'orgDesc' })
			output.translationKey.push(desc.translationKey)
			output.freeText.push(desc.freeText)
			orgData.descriptionId = desc.freeText.id
		}
		if (org['Alert Message ']) {
			const suppId = generateId('attributeSupplement')
			const alertMsg = generateFreeText({
				orgId,
				text: org['Alert Message '].trim(),
				type: 'attSupp',
				itemId: suppId,
			})
			output.organizationAttribute.push({ attributeId: attributes.alertMessage, organizationId: orgId })
			output.translationKey.push(alertMsg.translationKey)
			output.freeText.push(alertMsg.freeText)
			output.attributeSupplement.push({
				id: suppId,
				organizationAttributeOrganizationId: orgId,
				organizationAttributeAttributeId: attributes.alertMessage,
				textId: alertMsg.freeText.id,
			})
		}
		for (const attrib of orgAttributes) {
			if (org[attrib]) {
				const attributeId = attributeMap.get(attrib)
				if (!attributeId) continue
				output.organizationAttribute.push({ attributeId, organizationId: orgId })
			}
		}

		if (isNew) {
			const orgOut = Prisma.validator<Prisma.OrganizationCreateManyInput>()(
				orgData as NonNullable<unknown>
			) as Prisma.OrganizationCreateManyInput
			output.organizationNew.push({ id: orgId, ...orgOut })
		} else {
			const orgOut = Prisma.validator<Prisma.OrganizationUpdateArgs>()({
				where: { id: orgId },
				data: orgData,
			})
			output.organizationUp.push(orgOut)
		}
		const locations = data.orgLocation.filter(({ organizationId }) => organizationId === org.id)

		for (const loc of locations) {
			const orgLocationId = generateId('orgLocation')
			const locData: Prisma.OrgLocationCreateManyInput = {
				id: orgLocationId,
				orgId,
				name: loc['Location Name'].trim(),
				street1: loc['Street'],
				city: loc['City ']?.trim() ?? '',
				countryId: loc['Country '],
				govDistId: loc['State'],
				postCode: loc['PostalCode'],
				notVisitable: loc['Hide Location?'],
				mapCityOnly: loc['Hide Location?'],
			}
			const cca2 = countryMap.get(loc['Country '])
			const govDistAbbrev = govDistMap.get(loc['State'] ?? '')
			if (loc['City '] && cca2) {
				const searchString = compact([
					locData.street1,
					locData.city,
					govDistAbbrev,
					locData.postCode,
					cca2,
				]).join(', ')

				const searchParams = new URLSearchParams({
					text: searchString,
					format: 'json',
					apiKey: process.env.GEOAPIFY_API_KEY as string,
					filter: `countrycode:${activeCountries.join(',').toLowerCase()}`,
				})
				const geoURL = `https://api.geoapify.com/v1/geocode/search?${searchParams.toString()}`
				const geoResponse = await throttleApiCalls(async () => await fetch(geoURL))()
				const geoData = await geoResponse.json()
				const geoResult = geoData.results.length ? geoData.results[0] : null
				locData.latitude = geoResult?.lat
				locData.longitude = geoResult?.lon
				if (loc['Service Area Coverage - State(s)'] || loc['Service Area Coverage - USA National']) {
					const serviceAreaId = generateId('serviceArea')
					output.serviceArea.push({
						id: serviceAreaId,
						organizationId: orgId,
						orgLocationId: locData.id,
					})
					for (const country of loc['Service Area Coverage - USA National'] ?? []) {
						output.serviceAreaCountry.push({ serviceAreaId, countryId: country.trim() })
					}
					for (const dist of loc['Service Area Coverage - State(s)'] ?? []) {
						output.serviceAreaDist.push({ serviceAreaId, govDistId: dist.trim() })
					}
				}
			}
			output.orgLocation.push(locData)

			const phonesToLink = joins.orgLocationPhone.filter(({ locationId }) => locationId === loc.id)
			for (const phnLink of phonesToLink) {
				const phone = data.orgPhone.find(({ id }) => id === phnLink.phoneId)
				if (!phone) throw new Error(`Phone not found -- ${phnLink.phoneId}`)
				if (!output.orgPhone.find(({ legacyId }) => legacyId === phone.id)) {
					const newId = generateId('orgPhone')
					const cca2val = cca2 ?? 'US'
					const countrycode = isSupportedCountry(cca2val) ? cca2val : 'US'
					const parsedPhone = parsePhoneNumberWithError(
						compact([phone.number, phone.ext]).join(' '),
						countrycode
					)
					const phoneDesc = generateFreeText({
						orgId,
						type: 'phoneDesc',
						itemId: newId,
						text: phone.description,
					})
					output.translationKey.push(phoneDesc.translationKey)
					output.freeText.push(phoneDesc.freeText)
					output.orgPhone.push({
						id: newId,
						legacyId: phone.id,
						countryId: locData.countryId,
						number: parsedPhone.formatNational(),
						ext: parsedPhone.ext,
						descriptionId: phoneDesc.freeText.id,
					})
					output.orgLocationPhone.push({ orgLocationId, phoneId: newId })
				} else {
					const phoneDbRecord = output.orgPhone.find(({ legacyId }) => legacyId === phone.id)
					if (phoneDbRecord?.id) {
						output.orgLocationPhone.push({ orgLocationId, phoneId: phoneDbRecord.id })
					}
				}
			}
			const emailsToLink = joins.orgLocationEmail.filter(({ locationId }) => locationId === loc.id)
			for (const emailLink of emailsToLink) {
				const email = data.orgEmail.find(({ id }) => id === emailLink.emailId)
				if (!email) throw new Error(`Email not found -- ${emailLink.emailId}`)
				if (!output.orgEmail.find(({ legacyId }) => legacyId === email.id)) {
					const newId = generateId('orgEmail')
					const emailData: Prisma.OrgEmailCreateManyInput = {
						id: newId,
						legacyId: email.id,
						email: email.email,
					}
					if (email.description) {
						const emailDesc = generateFreeText({
							orgId,
							type: 'emailDesc',
							itemId: newId,
							text: email.description,
						})
						output.translationKey.push(emailDesc.translationKey)
						output.freeText.push(emailDesc.freeText)
					}
					output.orgEmail.push(emailData)
					output.orgLocationEmail.push({ orgLocationId, orgEmailId: newId })
				} else {
					const emailDbRecord = output.orgEmail.find(({ legacyId }) => legacyId === email.id)
					if (emailDbRecord?.id) {
						output.orgLocationEmail.push({ orgLocationId, orgEmailId: emailDbRecord.id })
					}
				}
			}
			const servicesToLink = joins.orgLocationService.filter(({ locationId }) => locationId === loc.id)
			for (const svc of servicesToLink) {
				const serv = data.orgService.find(({ id }) => id === svc.serviceId)
				if (!serv) {
					console.error(`Service not found -- ${svc.serviceId}`)
					continue
				}
				if (!output.orgService.find(({ legacyId }) => legacyId === serv.id)) {
					const newId = generateId('orgService')
					const servName = generateFreeText({ orgId, type: 'svcName', itemId: newId, text: serv[' Title'] })
					const servDesc = generateFreeText({
						orgId,
						type: 'svcDesc',
						itemId: newId,
						text: serv[' Description '],
					})
					output.translationKey.push(servName.translationKey)
					output.translationKey.push(servDesc.translationKey)
					output.freeText.push(servName.freeText)
					output.freeText.push(servDesc.freeText)
					output.orgService.push({
						id: newId,
						legacyId: serv.id,
						serviceNameId: servName.freeText.id,
						organizationId: orgId,
						descriptionId: servDesc.freeText.id,
					})
					for (const { tag } of serv[' Tag(s)'] ?? []) {
						output.orgServiceTag.push({ serviceId: newId, tagId: tag.trim() })
					}
					output.orgLocationService.push({ orgLocationId, serviceId: newId })

					//
					// Attributes
					//
					const serviceAccessToAdd = data.svcAccess.filter(({ serviceId }) => serviceId === serv.id)
					for (const sa of serviceAccessToAdd) {
						const saSupplementId = generateId('attributeSupplement')
						if (sa.type === '') continue
						const attributeId = attributes.serviceAccess[sa.type]
						output.attributeSupplement.push({
							id: saSupplementId,
							serviceAccessAttributeAttributeId: attributeId,
							serviceAccessAttributeServiceId: newId,
							data: JsonInputOrNull.parse(
								superjson.serialize({
									access_type: sa.type,
									access_value: sa.value,
								})
							),
						})
						output.serviceAccessAttribute.push({ attributeId, serviceId: newId })
					}

					for (const tag of serviceAttributes.all) {
						if (Object.keys(serv).includes(tag) && serv[tag]) {
							const attributeId = attributes[tag]
							if (!attributeId) throw new Error(`Unknown attribute -> ${tag}`)
							switch (tag) {
								case 'other-describe':
								case 'cost-fees': {
									const supplementId = generateId('attributeSupplement')
									const content = serv[tag]
									if (typeof content !== 'string') break
									const text = generateFreeText({
										orgId,
										type: 'attSupp',
										itemId: supplementId,
										text: content,
									})
									output.translationKey.push(text.translationKey)
									output.freeText.push(text.freeText)
									output.attributeSupplement.push({
										id: supplementId,
										serviceAttributeAttributeId: attributeId,
										serviceAttributeOrgServiceId: newId,
										textId: text.freeText.id,
									})
									output.serviceAttribute.push({ attributeId, orgServiceId: newId, active: true })
									break
								}
								case 'elig-age-max':
								case 'elig-age-min': {
									if (tag === 'elig-age-min' && typeof serv['elig-age-max'] === 'number') {
										const supplementId = generateId('attributeSupplement')
										output.attributeSupplement.push({
											id: supplementId,
											serviceAttributeAttributeId: attributeId,
											serviceAttributeOrgServiceId: newId,
											data: JsonInputOrNull.parse(
												superjson.serialize({ min: serv['elig-age-min'], max: serv['elig-age-max'] })
											),
										})
										output.serviceAttribute.push({ attributeId, orgServiceId: newId, active: true })
									} else if (tag === 'elig-age-max' && typeof serv['elig-age-min'] === 'number') {
										break
									} else {
										const supplementId = generateId('attributeSupplement')
										const data = {
											...(serv['elig-age-min'] ? { min: serv['elig-age-min'] } : {}),
											...(serv['elig-age-max'] ? { max: serv['elig-age-max'] } : {}),
										}
										output.attributeSupplement.push({
											id: supplementId,
											serviceAttributeAttributeId: attributeId,
											serviceAttributeOrgServiceId: newId,
											data: JsonInputOrNull.parse(superjson.serialize(data)),
										})
										output.serviceAttribute.push({ attributeId, orgServiceId: newId, active: true })
									}
									break
								}
								case 'lang-offered': {
									if (!serv['lang-offered']) break
									const langs = serv['lang-offered']
									for (const langId of langs) {
										const supplementId = generateId('attributeSupplement')
										output.attributeSupplement.push({
											id: supplementId,
											serviceAttributeAttributeId: attributeId,
											serviceAttributeOrgServiceId: newId,
											languageId: langId,
										})
									}
									output.serviceAttribute.push({ attributeId, orgServiceId: newId, active: true })
									break
								}
								default: {
									output.serviceAttribute.push({ attributeId, orgServiceId: newId, active: true })
								}
							}
						}
					}

					const phonesToLink = joins.orgServicePhone.filter(({ serviceId }) => serviceId === serv.id)
					const emailsToLink = joins.orgServiceEmail.filter(({ serviceId }) => serviceId === serv.id)
					for (const phn of phonesToLink) {
						const phoneDbRecord = output.orgPhone.find(({ legacyId }) => legacyId === phn.phoneId)
						if (phoneDbRecord?.id) {
							output.orgServicePhone.push({ serviceId: newId, orgPhoneId: phoneDbRecord.id })
						}
					}
					for (const eml of emailsToLink) {
						const emailDbRecord = output.orgEmail.find(({ legacyId }) => legacyId === eml.emailId)
						if (emailDbRecord?.id) {
							output.orgServiceEmail.push({ serviceId: newId, orgEmailId: emailDbRecord.id })
						}
					}
				} else {
					// Service record has already been created
					const serviceDbRecord = output.orgService.find(({ legacyId }) => legacyId === serv.id)
					if (serviceDbRecord?.id) {
						output.orgLocationService.push({ orgLocationId, serviceId: serviceDbRecord.id })
						if (serviceDbRecord.legacyId) {
							const phonesToLink = joins.orgServicePhone.filter(
								({ serviceId }) => serviceId === serviceDbRecord.legacyId
							)
							const emailsToLink = joins.orgServiceEmail.filter(
								({ serviceId }) => serviceId === serviceDbRecord.legacyId
							)
							for (const phn of phonesToLink) {
								const phoneDbRecord = output.orgPhone.find(({ legacyId }) => legacyId === phn.phoneId)
								if (phoneDbRecord?.id) {
									output.orgServicePhone.push({ serviceId: serviceDbRecord.id, orgPhoneId: phoneDbRecord.id })
								}
							}
							for (const eml of emailsToLink) {
								const emailDbRecord = output.orgEmail.find(({ legacyId }) => legacyId === eml.emailId)
								if (emailDbRecord?.id) {
									output.orgServiceEmail.push({ serviceId: serviceDbRecord.id, orgEmailId: emailDbRecord.id })
								}
							}
						}
					}
				}
			}
		}
	}

	fs.writeFileSync(path.resolve(__dirname, 'out.json'), JSON.stringify(output))
}

run()
