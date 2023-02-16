/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { geojsonToWKT } from '@terraformer/wkt'
import { type Geometry } from 'geojson'
import iso3166 from 'iso-3166-2'
import invariant from 'tiny-invariant'

import { prisma, Prisma, generateId } from '~db/index'
import {
	geoCountryData,
	geoCountyDataPR,
	geoProvinceDataCA,
	geoStateDataMX,
	geoStateDataUS,
	keySlug,
	namespaces,
} from '~db/seed/data/'
import { Log, iconList, updateGeo } from '~db/seed/lib'
import { logFile } from '~db/seed/logger'
import { ListrTask } from '~db/seed/starterData'

// import { GeoJSONSchema } from '~db/zod-util';

/** Set district types to add here. */
const districtTypes = [
	{ one: 'state', other: 'states' },
	{ one: 'district', other: 'districts' },
	{ one: 'county', other: 'counties' },
	{ one: 'outlying area', other: 'outlying areas' },
	{ one: 'province', other: 'provinces' },
	{ one: 'territory', other: 'territories' },
	{ one: 'city', other: 'cities' },
] as const

type DistrictTypes = (typeof districtTypes)[number]['one']
const govDist = new Map<DistrictTypes, string>()
const countryMap = new Map<string, string>()

const keyGen = (text: string, prefix?: string, suffix?: string) => {
	const slugText = `${prefix ?? ''} ${text} ${suffix ?? ''}`
	const key = keySlug(slugText.trim())

	return {
		key,
		ns: namespaces.govDist,
		text,
	}
}

const countryAll = async (task: ListrTask) => {
	let countA = 0
	const resultList: string[] = []

	for (const country in geoCountryData) {
		if (Object.prototype.hasOwnProperty.call(geoCountryData, country)) {
			const element = geoCountryData[country]
			const logMessage = `(${countA + 1}/${
				Object.keys(geoCountryData).length
			}) Updating GeoJSON data for ${country}`
			logFile.log(logMessage)
			task.output = logMessage
			await prisma.country.update({
				where: {
					cca2: country,
				},
				data: {
					geoJSON: element,
					geoWKT: geojsonToWKT(element),
				},
			})
			countA++
			resultList.push(country)
		}
	}
	const countries = await prisma.country.findMany({ select: { id: true, cca2: true } })
	countries.forEach(({ cca2, id }) => countryMap.set(cca2, id))

	task.title = `GeoJSON data for countries (${resultList.join(', ')})`
}

type DistTypeData = {
	translate: Prisma.TranslationKeyCreateManyInput[]
	translateChild: Prisma.TranslationKeyCreateManyInput[]
	govDistType: Prisma.GovDistTypeCreateManyInput[]
}

const upsertDistrictTypes = async (task: ListrTask) => {
	const log: Log = (message, icon?, indent = false) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		logFile.info(formattedMessage)
		task.output = formattedMessage
	}
	const ns = namespaces.govDist

	const data: DistTypeData = { translate: [], govDistType: [], translateChild: [] }

	const existing = await prisma.govDistType.findMany({ select: { id: true, name: true } })
	const distMap = new Map<string, string>()

	existing.forEach(({ id, name }) => {
		distMap.set(name, id)
		govDist.set(name as DistrictTypes, id)
	})

	for (const type of districtTypes) {
		log(`Preparing record for Governing District type: ${type.one}`, 'generate')

		const name = type.one
		const key = `type-${keySlug(type.one)}_one`
		const nameOther = type.other
		const keyOther = `type-${keySlug(type.one)}_other`
		const id = distMap.get(name) ?? generateId('govDistType')

		if (!distMap.has(name)) {
			data.translate.push({
				key,
				ns,
				text: name,
			})
			data.translateChild.push({
				key: keyOther,
				ns,
				text: nameOther,
			})

			data.govDistType.push({
				id,
				name,
				tsKey: key,
				tsNs: ns,
			})

			govDist.set(type.one, id)
		}
	}
	const translateResult = await prisma.translationKey.createMany({
		data: data.translate,
		skipDuplicates: true,
	})
	const result = await prisma.govDistType.createMany({ data: data.govDistType, skipDuplicates: true })
	log(`Governing district type records added: ${result.count}`, 'create')
	log(`Translation keys added: ${translateResult.count}`, 'create')

	task.title = `Governing District Types (${result.count} records, ${translateResult.count} translation keys)`
}

type CountryUSData = {
	translate: Prisma.TranslationKeyCreateManyInput[]
	govDist: Prisma.GovDistCreateManyInput[]
	childDist: Prisma.GovDistCreateManyInput[]
}

const countryUS = async (task: ListrTask) => {
	const log: Log = (message, icon?, indent = false, silent = false) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		logFile.info(formattedMessage)
		if (!silent) task.output = formattedMessage
	}
	const keySet = new Set<string>()
	try {
		let countB = 0

		const existing = await prisma.govDist.findMany({
			where: {
				country: {
					cca2: 'US',
				},
			},
			select: {
				id: true,
				slug: true,
				tsKey: true,
			},
		})

		const distIdMap = new Map<string, string>()
		existing.forEach(({ slug, id, tsKey }) => {
			distIdMap.set(slug, id)
			keySet.add(tsKey)
		})

		const countryId = countryMap.get('US')
		invariant(countryId)

		let translateResult = 0
		let parentResult = 0
		let childResult = 0

		for (const state of geoStateDataUS) {
			const data: CountryUSData = {
				translate: [],
				govDist: [],
				childDist: [],
			}
			const { name, abbrev, counties, geo } = state
			let countC = 0
			log(`(${countB + 1}/${geoStateDataUS.length}) Prepare Governing District: ${name}`)
			task.title = `GeoJSON data for US: (${countB + 1}/${geoStateDataUS.length}) - ${name} (${
				state.counties.length
			} Sub-Districts)`

			const isoData = iso3166.subdivision('US', state.name)
			invariant(isoData)
			const { code: iso, type: isoType } = isoData
			const govDistTypeId = govDist.get(isoType.toLowerCase() as DistrictTypes)
			invariant(govDistTypeId, `${isoType.toLowerCase()}`)

			const slug = keySlug(`US-${state.name}`)
			const { key: tsKey, ns: tsNs } = keyGen(name, 'us')
			const stateId = distIdMap.get(slug) ?? generateId('govDist')

			if (keySet.has(tsKey)) throw new Error('duplicate key', { cause: state })

			data.translate.push({
				key: tsKey,
				ns: tsNs,
				text: name,
			})
			data.govDist.push({
				id: stateId,
				name,
				slug,
				iso,
				abbrev,
				geoJSON: geo,
				geoWKT: geojsonToWKT(geo as Geometry),
				tsKey,
				tsNs,
				countryId,
				govDistTypeId,
			})
			keySet.add(tsKey)

			for (const county of counties) {
				const { NAME: countyName, LSAD } = county.properties
				log(
					`[${countC + 1}/${counties.length}] Prepare Governing Sub-District: ${countyName}`,
					'generate',
					true,
					true
				)

				const geoType = (search: string) => {
					const types = districtTypes.map((type) => type.one)
					const searchLower = search.toLowerCase()
					if (types.some((x) => x === searchLower)) return search.toLowerCase() as DistrictTypes
					return 'county'
				}
				const distType = govDist.get(geoType(LSAD))
				invariant(distType, 'Unknown district type')
				const slug = keySlug(`us-${state.name}-${countyName}-${geoType(LSAD)}`)
				const { key: tsKey, ns: tsNs, text: tsText } = keyGen(countyName, `us-${state.name}`, geoType(LSAD))

				if (keySet.has(tsKey)) throw new Error('duplicate key', { cause: county })

				data.translate.push({
					key: tsKey,
					ns: tsNs,
					text: tsText,
				})

				data.childDist.push({
					name: countyName,
					slug,
					geoJSON: county.geometry,
					geoWKT: geojsonToWKT(county.geometry as Geometry),
					countryId,
					govDistTypeId: distType,
					isPrimary: false,
					parentId: stateId,
					tsKey,
					tsNs,
				})
				keySet.add(tsKey)
				countC++
			}
			const createKeys = await prisma.translationKey.createMany({
				data: data.translate,
				skipDuplicates: true,
			})
			translateResult += createKeys.count
			const createDist = await prisma.govDist.createMany({
				data: data.govDist,
				skipDuplicates: true,
			})
			parentResult += createDist.count
			const createSubDist = await prisma.govDist.createMany({
				data: data.childDist,
				skipDuplicates: true,
			})
			childResult += createSubDist.count
			log(`District records added: ${createDist.count}`, 'create', true)
			log(`Sub-district records added: ${createSubDist.count}`, 'create', true)
			log(`Translation keys added: ${createKeys.count}`, 'create', true)
			countB++
		}

		log(`District records added: ${parentResult}`, 'create')
		log(`Sub-district records added: ${childResult}`, 'create')
		log(`Translation keys added: ${translateResult}`, 'create')

		task.title = `GeoJSON data for US (${parentResult} Districts, ${childResult} Sub-Districts, ${translateResult} translation keys)`
	} catch (err) {
		if (err instanceof Error) {
			logFile.log(JSON.stringify(err))
			throw err
		}
		logFile.log(err)
		throw new Error(err as string)
	}
}

type CountryCAData = {
	translate: Prisma.TranslationKeyCreateManyInput[]
	govDist: Prisma.GovDistCreateManyInput[]
}

const countryCA = async (task: ListrTask) => {
	const log: Log = (message, icon?, indent = false) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		logFile.info(formattedMessage)
		task.output = formattedMessage
	}

	let countB = 0
	const existing = await prisma.govDist.findMany({
		where: {
			country: {
				cca2: 'CA',
			},
		},
		select: {
			id: true,
			slug: true,
		},
	})

	const distIdMap = new Map<string, string>(existing.map(({ slug, id }) => [slug, id]))

	const countryId = countryMap.get('CA')
	invariant(countryId)

	const data: CountryCAData = {
		translate: [],
		govDist: [],
	}

	for (const province of geoProvinceDataCA) {
		const { name, abbrev, geo } = province
		log(`(${countB + 1}/${geoProvinceDataCA.length}) Prepare Governing District: ${name}`)
		task.title = `GeoJSON data for CA: (${countB + 1}/${geoProvinceDataCA.length}) - ${name}`

		const isoData = iso3166.subdivision('CA', province.name)
		invariant(isoData)
		const { code: iso, type: isoType } = isoData
		const govDistTypeId = govDist.get(isoType.toLowerCase() as DistrictTypes)
		invariant(govDistTypeId, 'Unknown district type')
		const slug = keySlug(`CA-${province.name}`)
		const { key, ns, text } = keyGen(name, 'ca')

		const provId = distIdMap.get(slug) ?? generateId('govDist')

		data.translate.push({
			key,
			ns,
			text,
		})

		data.govDist.push({
			id: provId,
			name,
			slug,
			iso,
			abbrev: abbrev ?? iso.slice(-2),
			geoJSON: geo,
			geoWKT: geojsonToWKT(geo as Geometry),
			countryId,
			govDistTypeId,
			tsKey: key,
			tsNs: ns,
		})

		countB++
	}
	const translateResult = await prisma.translationKey.createMany({
		data: data.translate,
		skipDuplicates: true,
	})
	const parentResult = await prisma.govDist.createMany({ data: data.govDist, skipDuplicates: true })
	log(`District records added: ${parentResult.count}`, 'create')
	log(`Translation keys added: ${translateResult.count}`, 'create')

	task.title = `GeoJSON data for CA (${parentResult.count} Districts, ${translateResult.count} translation keys)`
}

type CountryMXData = {
	translate: Prisma.TranslationKeyCreateManyInput[]
	govDist: Prisma.GovDistCreateManyInput[]
}
const countryMX = async (task: ListrTask) => {
	const log: Log = (message, icon?, indent = false) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		logFile.info(formattedMessage)
		task.output = formattedMessage
	}
	let countB = 0
	const existing = await prisma.govDist.findMany({
		where: {
			country: {
				cca2: 'MX',
			},
		},
		select: {
			id: true,
			slug: true,
		},
	})

	const distIdMap = new Map<string, string>(existing.map(({ slug, id }) => [slug, id]))

	const countryId = countryMap.get('MX')
	invariant(countryId)

	const data: CountryMXData = {
		translate: [],
		govDist: [],
	}

	for (const state of geoStateDataMX) {
		const { name, abbrev, geo, type } = state
		log(`(${countB + 1}/${geoStateDataMX.length}) Prepare Governing District: ${name}`, 'generate')
		task.title = `GeoJSON data for MX: (${countB + 1}/${geoStateDataMX.length}) - ${name}`

		const { code: iso } = (state.name === 'Distrito Federal'
			? { code: 'MX-CMX' }
			: iso3166.subdivision('MX', state.name)) ?? { code: undefined }

		const govDistTypeId = govDist.get(type)
		invariant(govDistTypeId, 'Unknown district type')

		const slug = keySlug(`MX-${state.name}`)
		const { key, ns, text } = keyGen(name, 'mx')

		const stateId = distIdMap.get(slug) ?? generateId('govDist')

		data.translate.push({
			key,
			ns,
			text,
		})

		data.govDist.push({
			id: stateId,
			name,
			slug,
			iso,
			abbrev: abbrev ?? iso?.slice(-2),
			geoJSON: geo,
			geoWKT: geojsonToWKT(geo as Geometry),
			countryId,
			govDistTypeId,
			tsKey: key,
			tsNs: ns,
		})

		countB++
	}
	const translateResult = await prisma.translationKey.createMany({
		data: data.translate,
		skipDuplicates: true,
	})
	const parentResult = await prisma.govDist.createMany({ data: data.govDist, skipDuplicates: true })
	log(`District records added: ${parentResult.count}`, 'create')
	log(`Translation keys added: ${translateResult.count}`, 'create')
	task.title = `GeoJSON data for MX (${parentResult.count} Districts, ${translateResult.count} translation keys)`
}

type PRData = {
	translate: Prisma.TranslationKeyCreateManyInput[]
	govDist: Prisma.GovDistCreateManyInput[]
}
const countiesPR = async (task: ListrTask) => {
	const log: Log = (message, icon?, indent = false) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		logFile.info(formattedMessage)
		task.output = formattedMessage
	}
	let countB = 0
	const existing = await prisma.govDist.findMany({
		where: {
			country: {
				cca2: 'PR',
			},
		},
		select: {
			id: true,
			slug: true,
		},
	})

	const distIdMap = new Map<string, string>(existing.map(({ slug, id }) => [slug, id]))

	const countryId = countryMap.get('PR')
	invariant(countryId)

	const data: PRData = {
		translate: [],
		govDist: [],
	}

	for (const county of geoCountyDataPR) {
		const name = county.properties.NAME
		log(`(${countB + 1}/${geoCountyDataPR.length}) Prepare Governing District: ${name}`, 'generate')
		task.title = `GeoJSON data for PR: (${countB + 1}/${geoCountyDataPR.length}) - ${name}`

		const govDistTypeId = govDist.get('county')
		invariant(govDistTypeId, 'Unknown district type')

		const slug = keySlug(`PR-${name}`)
		const { key, ns, text } = keyGen(name, 'pr')

		const stateId = distIdMap.get(slug) ?? generateId('govDist')

		data.translate.push({
			key,
			ns,
			text,
		})

		data.govDist.push({
			id: stateId,
			name,
			slug,
			// iso,
			geoJSON: county.geometry,
			geoWKT: geojsonToWKT(county.geometry as Geometry),
			countryId,
			govDistTypeId,
			tsKey: key,
			tsNs: ns,
		})
		countB++
	}
	const translateResult = await prisma.translationKey.createMany({
		data: data.translate,
		skipDuplicates: true,
	})
	const parentResult = await prisma.govDist.createMany({ data: data.govDist, skipDuplicates: true })
	log(`District records added: ${parentResult.count}`, 'create')
	log(`Translation keys added: ${translateResult.count}`, 'create')

	task.title = `GeoJSON data for PR (${parentResult.count} Districts, ${translateResult.count} translation keys)`
}

const updateGeoTask = async (task: ListrTask) => {
	const log: Log = (message, icon?, indent = false) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		logFile.info(formattedMessage)
		task.output = formattedMessage
	}
	const { country, govDist, orgLocation } = await updateGeo()

	const output = `[Countries: ${country}] [GovDists: ${govDist}] [OrgLocations: ${orgLocation}]`

	log(`GeoData records updated: ${output}`)
	task.title = `${task.title} (${output})`
}

const renderOptions = {
	bottomBar: 10,
}
export const seedGeoData = (task: ListrTask) =>
	task.newListr([
		{
			title: 'Governing District Types',
			task: async (_ctx: unknown, task: ListrTask): Promise<void> => upsertDistrictTypes(task),
			options: renderOptions,
		},
		{
			title: 'GeoJSON data for countries',
			task: async (_ctx: unknown, task: ListrTask): Promise<void> => countryAll(task),
			options: renderOptions,
		},
		{
			title: 'GeoJSON data for US',
			task: async (_ctx: unknown, task: ListrTask): Promise<void> => countryUS(task),
			options: renderOptions,
		},
		{
			title: 'GeoJSON data for PR',
			task: async (_ctx: unknown, task: ListrTask): Promise<void> => countiesPR(task),
			options: renderOptions,
		},
		{
			title: 'GeoJSON data for CA',
			task: async (_ctx: unknown, task: ListrTask): Promise<void> => countryCA(task),
			options: renderOptions,
		},
		{
			title: 'GeoJSON data for MX',
			task: async (_ctx: unknown, task: ListrTask): Promise<void> => countryMX(task),
			options: renderOptions,
		},
		{
			title: 'Process GeoJSON to PostGIS format',
			task: async (_ctx: unknown, task: ListrTask): Promise<void> => updateGeoTask(task),
			options: renderOptions,
		},
	])
