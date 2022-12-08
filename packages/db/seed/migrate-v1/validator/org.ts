// import { Prisma, SourceType } from '@prisma/client'
import cuid from 'cuid'
import { flatten } from 'flat'
import slugify from 'slugify'

import { Prisma, SourceType } from '~/client'
import { OrganizationsJSONCollection } from '~/datastore/v1/mongodb/output-types/organizations'
import { prisma } from '~/index'
import { namespaces } from '~/seed/data'

/**
 * It takes a name, city, and state, and returns a unique slug based on those values
 *
 * @param {string} name - The name of the organization
 * @param {string} [city] - The city of the organization
 * @param {string} [state] - The state the organization is located in
 * @returns A slug based on name and city/state, if needed.
 */
const uniqueSlug = async (name: string, city?: string, state?: string) => {
	const check = async (slug: string) => {
		const existing = await prisma.organization.findUnique({
			where: {
				slug,
			},
			select: {
				slug: true,
			},
		})
		return existing?.slug ? false : true
	}
	const slugs = [slugify(name), slugify(`${name} ${state}`), slugify(`${name} ${city} ${state}`)]
	for (const slug of slugs) {
		if (await check(slug)) return slug
	}
	throw new Error('Unable to generate unique slug')
}

const connectIfExist = <T>(records: T): ConnectRecords<T> => {
	if (typeof records === undefined || (Array.isArray(records) && records.length === 0)) return undefined
	return {
		connect: {
			...records,
		},
	}
}
const createtIfExist = <T>(records: T): CreateRecords<T> => {
	if (typeof records === undefined || (Array.isArray(records) && records.length === 0)) return undefined
	return {
		create: {
			...records,
		},
	}
}

/**
 * It takes in a `params` object, and returns a `Promise` that resolves to a `TranslationKey` object
 *
 * @param params - {
 * @returns The key and id of the translation key
 */
const generateKey: GenerateKey<KeyType> = async (params) => {
	const { type, orgSlug, text } = params
	let ns = ''
	let key = ''
	switch (type) {
		case 'desc':
			ns = namespaces.orgDescription
			key = orgSlug
			break
		case 'svc':
			ns = namespaces.orgService
			key = params.subtype === 'access' ? `${orgSlug}.access` : `${orgSlug}.desc`
			break
		case 'attrSupp':
			ns = namespaces.orgService
			key = `${orgSlug}.attribute.${params.suppId}`
			break
	}
	return await prisma.translationKey.upsert({
		where: {
			ns_key: {
				ns,
				key,
			},
		},
		create: {
			key,
			text,
			namespace: {
				connect: {
					name: ns,
				},
			},
		},
		update: {
			text,
		},
		select: {
			key: true,
			id: true,
		},
	})
}

/** It returns a list of service categories, each of which contains a list of services */
const getServiceTags = async () =>
	await prisma.serviceCategory.findMany({
		select: {
			category: true,
			services: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	})

/**
 * Gets a list of all attributes with their categories. If an attribute is attached to more than one category,
 * it will have a separate record.
 *
 * @returns An array of attribute records with category name flattened.
 */
const getAttributeList = async () => {
	const results = await prisma.attribute.findMany({
		select: {
			id: true,
			tag: true,
			category: {
				select: {
					tag: true,
				},
			},
			requireBoolean: true,
			requireCountry: true,
			requireData: true,
			requireLanguage: true,
			requireText: true,
		},
	})
	return results.flatMap((record) =>
		record.category.map((cat) => ({
			...record,
			category: cat.tag,
		}))
	)
}

/**
 * It returns a list of government districts and countries
 *
 * @returns An object with two properties, area and country.
 */
const getServiceAreas = async () => {
	const area = await prisma.govDist.findMany({
		select: {
			id: true,
			slug: true,
		},
	})
	const country = await prisma.country.findMany({
		where: {
			cca2: {
				in: ['CA', 'MX', 'US'],
			},
		},
		select: {
			id: true,
			cca2: true,
			name: true,
		},
	})

	return { area, country }
}

const getLanguages = async () => {
	const result = await prisma.language.findMany({
		select: {
			id: true,
			languageName: true,
		},
	})
	return result
}

/**
 * It takes a value, converts it to a string, converts that string to lowercase, and then returns true if the
 * string is "yes" or "true", false if it's "no" or "false", and undefined if it's "unknown"
 *
 * @param val - Typeof value
 * @returns A function that takes a value and returns a boolean.
 */
const isTruthy = (val: string | boolean | number | undefined | unknown[]) => {
	const check = val?.toString().toLocaleLowerCase()
	if (check === 'unknown') return undefined
	if (check === 'yes' || check === 'true') return true
	return false
}

const generateServices: GenerateServices = async (services, orgSlug) => {
	const servIds = {}
	const serviceTags = await getServiceTags()
	const attributeList = await getAttributeList()
	const serviceAreas = await getServiceAreas()
	const languages = await getLanguages()
	serviceTags.forEach((serv) => {
		serv.services.forEach((x) => (servIds[`${serv.category}.${x.name}`] = x.id))
	})

	const data: Prisma.OrgServiceCreateInput[] = services.map((service) => {
		const servId = cuid()
		const flatServ: Record<string, string> = flatten(service.tags)

		/* It's mapping over the flattened service tags, and returning the id of the new service tag. */
		const tagIds = Object.keys(flatServ).map((serv) => {
			let id = ''
			const servKey = serv.substring(serv.indexOf('.') + 1, serv.length)
			if (Object.keys(servIds).includes(servKey)) {
				id = servIds[servKey]
			}
			return { id }
		})

		const unsupportedAttribute: Record<string, unknown> = {}
		const attributeConnect: Prisma.AttributeWhereUniqueInput[] = []
		const attrSuppCreate: Prisma.AttributeSupplementCreateWithoutServiceInput[] = []
		const serviceAreaConnect: Prisma.GovDistWhereUniqueInput[] = []
		const serviceAreaNationalConnect: Prisma.CountryWhereUniqueInput[] = []

		/**
		 * > It takes a tag and a value, and returns an object with the attribute record, the data, and the type of
		 * > attribute
		 *
		 * @param tag - The tag that is being checked
		 * @param value - The value of the tag.
		 * @returns An object with a type, data, and attribute property.
		 */
		const tagCheck: TagCheck = (tag, value) => {
			const speakerRegex = /community-(.+)-speakers/gi
			const langRegex = /lang-(.+)/gi
			const areaRegex = /service-(?:county|national|state)-(.+)/gi
			/**
			 * It returns the attribute record from the attributeList array.
			 *
			 * @param {string} tag - The tag of the attribute you want to get.
			 * @returns The result of the find function.
			 */
			const getAttrRecord = (tag: string) => {
				const result = attributeList.find((x) => `${x.category}-${x.tag}` === tag || x.tag === tag)
				if (result) return result
			}
			/**
			 * It takes a string, splits it into an array, discards the first element ('service'), separates out the
			 * second element ('county', 'national', or 'state), joins the remaining elements (the region), and then
			 * uses the result to find a matching record in an array. Any 'city' records are discarded and loaded to
			 * 'unsupported attributes'
			 *
			 * @param {string} tag - The tag that was clicked on
			 * @returns The ID of the service area
			 */
			const getAreaRecord = (tag: string) => {
				const tagBreakdown = tag.split('-')
				tagBreakdown.shift()
				const type = tagBreakdown.shift()
				const search = tagBreakdown.join('-')
				const state = new RegExp(`\\w{2}-${search}`, 'gi')
				const county = new RegExp(`\\w{2}-${search}-.*`, 'gi')
				if (type === 'city') return undefined
				if (type === 'national') {
					const result = serviceAreas.country.find((x) => search.replace('-', ' ') === x.name.toLowerCase())
					return {
						type: 'country' as const,
						id: result?.id,
					}
				}
				const result = serviceAreas.area.find((x) => x.slug.match(type === 'county' ? county : state))
				return {
					type: 'dist' as const,
					id: result?.id,
				}
			}

			/**
			 * It creates a new object with a type of `unknown` and an attribute of `incompatible-info` and a data
			 * object with a single key of `tag` and a value of `value`
			 *
			 * @param {string} tag - The tag of the incompatible-info attribute.
			 * @param {string | number | boolean} [value] - The value of the tag.
			 */
			const incompatible = (tag: string, value?: string | number | boolean) => ({
				attribute: getAttrRecord('incompatible-info') as AttributeRecord,
				data: { [tag]: value },
				type: 'unknown' as const,
			})

			let servAttribute: AttributeRecord | undefined
			let areaAttribute: ServiceAreaRecord | undefined

			/* Ensure that `value` is a not an array. */
			value = Array.isArray(value) ? JSON.stringify(value) : value
			let data: AttributeData = { value }

			let type: AttributeType = 'attribute'

			/* Parsing the tag and determining what type of attribute it is. */
			switch (true) {
				/* Full tag match */
				case getAttrRecord(tag) !== undefined: {
					servAttribute = getAttrRecord(tag)
					const { requireBoolean: boolean, requireText: text } = servAttribute ?? {
						boolean: undefined,
						text: undefined,
					}
					data = {
						boolean: boolean ? isTruthy(value) : undefined,
						text: text ? value?.toString() : undefined,
						data: !boolean && !text ? value : undefined,
					}
					break
				}
				/* `community-xx-speaker` */
				case !!speakerRegex.exec(tag): {
					servAttribute = getAttrRecord('language-speakers')
					const [, lang] = speakerRegex.exec(tag) ?? [undefined, '']
					const langRecord = languages.find((language) => language.languageName.toLowerCase() === lang)
					if (!langRecord) {
						return incompatible(tag)
					}
					data = { language: langRecord }
					break
				}
				/* `lang-xx` */
				case !!langRegex.exec(tag): {
					servAttribute = getAttrRecord('lang-offered')
					const [, lang] = langRegex.exec(tag) ?? [undefined, '']
					const langRecord = languages.find((language) => language.languageName.toLowerCase() === lang)
					if (!langRecord) {
						return incompatible(tag)
					}
					data = { language: langRecord }
					break
				}
				/* `service-{county|national|state}-xx...` */
				case !!areaRegex.exec(tag): {
					const area = getAreaRecord(tag)
					if (typeof area?.id !== 'string') return incompatible(tag)
					areaAttribute = area as ServiceAreaRecord
					type = 'area' as const
					break
				}
			}

			/* Checking if the areaAttribute and servAttribute are undefined. If they are, it returns the
incompatible-tag data . */
			if (typeof areaAttribute === undefined && typeof servAttribute === undefined) {
				return incompatible(tag, value)
			}

			return type === 'attribute'
				? {
						type: 'attribute',
						data,
						attribute: servAttribute as AttributeRecord,
				  }
				: {
						type: 'area',
						data,
						attribute: areaAttribute as ServiceAreaRecord,
				  }
		}

		const handleUnsupported = (tag: AttributeReturnArea | AttributeReturnService) => {
			Object.assign(unsupportedAttribute, tag.data)
		}

		/**
		 * Handle service properties
		 *
		 * Translate over tags - if unable to match, add to "incompatible-tags" attribute
		 */
		if (typeof service.properties === 'object' && Object.keys(service.properties).length) {
			/** Loop over each service property */
			Object.entries(service.properties).forEach(async ([key, value]) => {
				const tagRecord = tagCheck(key, value)

				switch (tagRecord.type) {
					case 'unknown': {
						handleUnsupported(tagRecord)
						break
					}
					case 'attribute': {
						const { attribute: attrRecord, data: attrData } = tagRecord
						attributeConnect.push({ id: attrRecord.id })
						/** Base record for connection to service tag */
						const attrBase: Prisma.AttributeSupplementCreateWithoutServiceInput = {
							serviceTag: {
								connect: {
									id: attrRecord?.id,
								},
							},
						}
						/* Checking the attribute record for the attribute type and then creating the attribute accordingly. */
						switch (true) {
							case attrRecord.requireBoolean: {
								// const boolean = isTruthy(value)
								const boolean = attrData?.boolean
								attrSuppCreate.push({ ...attrBase, boolean })
								break
							}
							case attrRecord.requireLanguage: {
								const id = attrData?.language?.id
								attrSuppCreate.push({ ...attrBase, language: { connect: { id } } })
								break
							}
							case attrRecord.requireText: {
								const text = attrData?.text
								if (!text) break
								const suppId = cuid()
								const textKey = await generateKey({
									type: 'attrSupp',
									text,
									suppId,
									orgSlug,
								})
								attrSuppCreate.push({ ...attrBase, id: suppId, textKey: { connect: textKey } })
								break
							}
						}
						break
					}
					case 'area': {
						// connect service area
						break
					}
				}
			})
		}

		return {
			id: servId,
			service: connectIfExist(tagIds),
			attributes: connectIfExist(attributeConnect),

			attributeSupplement: createtIfExist(attrSuppCreate),
			serviceArea: {
				create: {
					areas: connectIfExist(serviceAreaConnect),
					country: connectIfExist(serviceAreaNationalConnect),
				},
			},
		}
	})
	return { create: data }
}

export const upsertOrg = async (org: OrganizationsJSONCollection) => {
	const orgExists = async (legacyId: string) => {
		const check = await prisma.organization.findUnique({
			where: { legacyId },
			select: { legacyId: true, id: true },
		})
		return !!check?.legacyId ? { exists: true, id: check.id } : false
	}
	const exists = await orgExists(org._id.$oid)

	const primaryLocation = org.locations.find((location) => location.is_primary)
	const slug = await uniqueSlug(org.name, primaryLocation?.city, primaryLocation?.state)
	const source = `migration` as string

	if (!exists) {
		const sourceCreate = { create: { source, type: 'SYSTEM' as SourceType } }
		/* Generate Description stub */
		const { id: descKeyId } = org.description
			? await generateKey({ type: 'desc', orgSlug: slug, text: org.description })
			: { id: undefined }
		const description = descKeyId ? { create: { key: { connect: { id: descKeyId } } } } : undefined
		/* Generate Services stub */
		const services = org.services.length ? await generateServices(org.services, slug) : undefined
		return {
			exists,
			org: prisma.organization.create({
				data: {
					legacyId: org._id.$oid,
					name: org.name,
					slug,
					createdAt: org.created_at.$date,
					updatedAt: org.updated_at.$date,
					source: sourceCreate,
					description,
					services,
				},
			}),
		}
	}
}

/** Type land. */

type KeyType = 'desc' | 'svc' | 'attrSupp'
type DescKey = { type: 'desc'; orgSlug: string; text: string }
type SvcKey = { type: 'svc'; orgSlug: string; text: string; subtype: 'access' | 'desc' }
type AttrSuppKey = { type: 'attrSupp'; orgSlug: string; text: string; suppId: string }
type GenerateKey<T> = (
	params: T extends 'desc' ? DescKey : T extends 'svc' ? SvcKey : AttrSuppKey
) => Promise<{ id: string; key: string }>

type ConnectRecords<T> =
	| {
			connect: T
	  }
	| undefined
type CreateRecords<T> =
	| {
			create: T
	  }
	| undefined

type AttributeRecord = Awaited<ReturnType<typeof getAttributeList>>[number]
type ServiceAreaRecord = { type: 'country' | 'dist'; id: string }
type AttributeData = {
	boolean?: boolean
	text?: string
	language?: Awaited<ReturnType<typeof getLanguages>>[number]
} & Record<string, string | boolean | number | undefined | Record<string, string | number | boolean>>
type AttributeType = 'attribute' | 'area' | 'unknown'
type AttributeReturnService = {
	attribute: AttributeRecord
	data?: AttributeData
	type: Exclude<AttributeType, 'area'>
}
type AttributeReturnArea = {
	attribute: ServiceAreaRecord
	data?: AttributeData
	type: Extract<AttributeType, 'area'>
}
type TagCheck = (
	tag: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value?: string | boolean | number | any[]
) => AttributeReturnService | AttributeReturnArea

type GenerateServices = (
	services: OrganizationsJSONCollection['services'],
	orgSlug: string
) => Promise<Prisma.OrgServiceCreateNestedManyWithoutOrganizationInput>
