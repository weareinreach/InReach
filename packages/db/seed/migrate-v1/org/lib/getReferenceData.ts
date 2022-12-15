import { prisma } from '~/index'

/** It returns all the service categories and the services that belong to each category */
const getServiceTags = async () => {
	const result = await prisma.serviceCategory.findMany({
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
	const servTagMap = new Map(
		result.flatMap((serv) => serv.services.map((x) => [`${serv.category}.${x.name}`, x.id]))
	)
	return servTagMap
}
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
	const flatResults = results.flatMap((record) =>
		record.category.map((cat) => ({
			...record,
			category: cat.tag,
		}))
	)
	const attributeMap = new Map(
		flatResults.map(({ category, tag, ...rest }) => [`${category}-${tag}`, { category, tag, ...rest }])
	)

	return attributeMap
}

/**
 * It returns a list of government districts and countries
 *
 * @returns An object with two properties, area and country.
 */
const getServiceAreas = async () => {
	const distList = await prisma.govDist.findMany({
		select: {
			id: true,
			slug: true,
			name: true,
		},
	})
	const country = await prisma.country.findMany({
		where: {
			cca2: {
				in: ['CA', 'MX', 'US', 'PR', 'VI', 'GU'],
			},
		},
		select: {
			id: true,
			cca2: true,
			name: true,
		},
	})
	const distMap = new Map(distList.map(({ id, slug }) => [slug, { id, name }]))
	const countryMap = new Map(country.map(({ cca2, id, name }) => [cca2, { id, name }]))
	const countryNameMap = new Map(country.map(({ id, name }) => [name, { id, name }]))

	return { distMap, countryMap, countryNameMap, distList }
}

/**
 * It returns a list of all languages in the database
 *
 * @returns An array of objects with the id and languageName properties.
 */
const getLanguages = async () => {
	const result = await prisma.language.findMany({
		select: {
			id: true,
			languageName: true,
			localeCode: true,
		},
	})
	const langMap = new Map(result.map(({ id, languageName }) => [languageName.toLowerCase(), id]))
	const localeMap = new Map(result.map(({ id, localeCode }) => [localeCode.toLowerCase(), id]))
	return { langMap, localeMap }
}

const getCountryMap = async () => {
	const result = await prisma.country.findMany({
		select: {
			id: true,
			cca2: true,
		},
	})
	const resultMap = new Map(result.map((x) => [x.cca2, x.id]))
	return resultMap
}

const getSocialMediaMap = async () => {
	const result = await prisma.socialMediaService.findMany({
		select: {
			id: true,
			name: true,
		},
	})
	const resultMap = new Map(result.map((x) => [x.id, x.name]))
	return resultMap
}

export const getReferenceData = async (): Promise<ReferenceData> => {
	const serviceTags = await getServiceTags()
	const attributeList = await getAttributeList()
	const { distList, distMap, countryNameMap } = await getServiceAreas()
	const { langMap, localeMap } = await getLanguages()
	const countryMap = await getCountryMap()
	const socialMediaMap = await getSocialMediaMap()

	const references = {
		serviceTags,
		attributeList,
		distList,
		distMap,
		langMap,
		localeMap,
		countryMap,
		countryNameMap,
		socialMediaMap,
	}
	return references
}

/** @param - Flattened tag in format: `serviceCategory.serviceName` @returns id for Service record */
export type ServiceTagMap = Awaited<ReturnType<typeof getServiceTags>>
/** @param - Flattened tag in format: `category-tag` @returns Attribute record */
export type AttributeListMap = Awaited<ReturnType<typeof getAttributeList>>
/** @param - GovDist slug @returns id for GovDist record */
export type DistMap = Awaited<ReturnType<typeof getServiceAreas>>['distMap']
/** @param - Language name (lowercase) @returns id for Language record */
export type LanguageMap = Awaited<ReturnType<typeof getLanguages>>['langMap']
/** @param - Locale code @returns id for Language record */
export type LocaleMap = Awaited<ReturnType<typeof getLanguages>>['localeMap']
/** @param - Cca2 code (two letters, uppercase) @returns id for Country record */
export type CountryMap = Awaited<ReturnType<typeof getCountryMap>>
/** @param - Social media service name (lowercase) @returns id for Social Media Service record */
export type SocialMediaMap = Awaited<ReturnType<typeof getSocialMediaMap>>
/** @param - Country name (lowercase) @returns id & name of Country record */
export type CountryNameMap = Awaited<ReturnType<typeof getServiceAreas>>['countryNameMap']

export type DistList = Awaited<ReturnType<typeof getServiceAreas>>['distList']

export type ReferenceData = {
	serviceTags: ServiceTagMap
	attributeList: AttributeListMap
	distMap: DistMap
	langMap: LanguageMap
	localeMap: LocaleMap
	countryMap: CountryMap
	socialMediaMap: SocialMediaMap
	countryNameMap: CountryNameMap
	distList: DistList
}
