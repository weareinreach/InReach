import { GovDist, Prisma } from '@prisma/client'
import iso3166 from 'iso-3166-2'

import { prisma } from '~/index'
import {
	geoCountryData,
	geoProvinceDataCA,
	geoStateDataMX,
	geoStateDataUS,
	keySlug,
	namespaces,
} from '~/seed/data/'
import { logFile } from '~/seed/logger'
import { ListrTask } from '~/seed/starterData'

/** Set district types to add here. */
const districtTypes = ['state', 'district', 'county', 'outlying area', 'province', 'territory'] as const

type DistrictTypes = typeof districtTypes[number]
const govDist = new Map<DistrictTypes, string>()

const connectTo = (id: string) => ({
	connect: {
		id,
	},
})

const upsertNamespace = async () =>
	await prisma.translationNamespace.upsert({
		where: {
			name: namespaces.govDist,
		},
		create: {
			name: namespaces.govDist,
		},
		update: {},
		select: { id: true },
	})

const nsCoC = async (text: string, prefix?: string) => {
	const slugText = prefix ? `${prefix}-${text}` : text
	const key = keySlug(slugText)

	return {
		connectOrCreate: {
			where: {
				ns_key: {
					key,
					ns: namespaces.govDist,
				},
			},
			create: {
				key,
				text,
				namespace: {
					connect: {
						name: namespaces.govDist,
					},
				},
			},
		},
	}
}

const countryAll = async (task: ListrTask) => {
	let countA = 0
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
				},
			})
			countA++
		}
	}
	task.title = `GeoJSON data for countries (US, CA, MX)`
}

const upsertDistrictTypes = async (task: ListrTask) => {
	await upsertNamespace()
	let logMessage = ''
	let countA = 0
	for (const type of districtTypes) {
		logMessage = `Upserting Governing District type: ${type}`
		logFile.log(logMessage)
		task.output = logMessage
		const { id } = await prisma.govDistType.upsert({
			where: {
				name: type,
			},
			create: {
				name: type,
				key: await nsCoC(type, 'type'),
			},
			update: {},
			select: {
				id: true,
			},
		})
		countA++
		govDist.set(type, id)
	}
	task.title = `Governing District Types (${countA + 1} records)`
}

const countryUS = async (task: ListrTask) => {
	let logMessage = ''
	let countB = 0
	let countA = 0
	await upsertNamespace()

	const { id: countryId } = await prisma.country.findUniqueOrThrow({
		where: {
			cca2: 'US',
		},
		select: {
			id: true,
		},
	})

	for (const state of geoStateDataUS) {
		const { name, abbrev, counties, geo } = state
		let countC = 0
		logMessage = `(${countB + 1}/${geoStateDataUS.length}) Upserting Governing District: ${name}`
		logFile.log(logMessage)
		task.output = logMessage
		task.title = `GeoJSON data for US: (${countB + 1}/${geoStateDataUS.length}) - ${name} (${
			state.counties.length
		} Sub-Districts)`
		const { code: iso, type: isoType } = iso3166.subdivision('US', state.name)
		const distType = govDist.get(isoType.toLowerCase())
		if (!distType) throw new Error('Unknown district type')
		const slug = keySlug(`US-${state.name}`)
		const key = await nsCoC(name, 'us')
		const { id: stateId } = await prisma.govDist.upsert({
			where: {
				slug,
			},
			create: {
				name,
				slug,
				iso,
				abbrev,
				geoJSON: geo,
				country: connectTo(countryId),
				govDistType: connectTo(distType),
				key,
			},
			update: {
				name,
				iso,
				abbrev,
				geoJSON: geo,
				country: connectTo(countryId),
				govDistType: connectTo(distType),
				key,
			},
			select: { id: true },
		})

		const bulkCounties: Prisma.Prisma__GovDistClient<Partial<GovDist>>[] = []
		for (const county of counties) {
			const { NAME: countyName } = county.properties
			logMessage = `  [${countC + 1}/${counties.length}] Upserting Governing Sub-District: ${countyName}`
			logFile.log(logMessage)
			task.output = logMessage
			const slug = keySlug(`US-${state.name}-${countyName}`)
			const distType = govDist.get('county')
			if (!distType) throw new Error('Unknown district type')
			const key = await nsCoC(countyName, `us-${state.name}`)
			bulkCounties.push(
				prisma.govDist.upsert({
					where: {
						slug,
					},
					create: {
						name: countyName,
						slug,
						geoJSON: county,
						country: connectTo(countryId),
						govDistType: connectTo(distType),
						isPrimary: false,
						parent: connectTo(stateId),
						key,
					},
					update: {
						name: countyName,
						geoJSON: county,
						country: connectTo(countryId),
						govDistType: connectTo(distType),
						isPrimary: false,
						parent: connectTo(stateId),
						key,
					},
				})
			)
			countA++
			countC++
		}
		await prisma.$transaction(bulkCounties)
		countB++
	}
	task.title = `GeoJSON data for US (${countB + 1} Districts, ${countA + 1} Sub-Districts)`
}

const countryCA = async (task: ListrTask) => {
	let logMessage = ''
	let countB = 0
	await upsertNamespace()

	const { id: countryId } = await prisma.country.findUniqueOrThrow({
		where: {
			cca2: 'CA',
		},
		select: {
			id: true,
		},
	})

	for (const province of geoProvinceDataCA) {
		const { name, abbrev, geo } = province
		logMessage = `(${countB + 1}/${geoProvinceDataCA.length}) Upserting Governing District: ${name}`
		logFile.log(logMessage)
		task.output = logMessage
		task.title = `GeoJSON data for CA: (${countB + 1}/${geoProvinceDataCA.length}) - ${name}`
		const { code: iso, type: isoType } = iso3166.subdivision('CA', province.name)
		const distType = govDist.get(isoType.toLowerCase())
		if (!distType) throw new Error('Unknown district type')
		const slug = keySlug(`CA-${province.name}`)
		const key = await nsCoC(name, 'ca')
		await prisma.govDist.upsert({
			where: {
				slug,
			},
			create: {
				name,
				slug,
				iso,
				abbrev,
				geoJSON: geo,
				country: connectTo(countryId),
				govDistType: connectTo(distType),
				key,
			},
			update: {
				name,
				iso,
				abbrev,
				geoJSON: geo,
				country: connectTo(countryId),
				govDistType: connectTo(distType),
				key,
			},
			select: { id: true },
		})

		countB++
	}
	task.title = `GeoJSON data for CA (${countB + 1} Districts)`
}

const countryMX = async (task: ListrTask) => {
	let logMessage = ''
	let countB = 0
	await upsertNamespace()

	const { id: countryId } = await prisma.country.findUniqueOrThrow({
		where: {
			cca2: 'MX',
		},
		select: {
			id: true,
		},
	})
	for (const state of geoStateDataMX) {
		const { name, abbrev, geo, type } = state
		logMessage = `(${countB + 1}/${geoStateDataUS.length}) Upserting Governing District: ${name}`
		logFile.log(logMessage)
		task.output = logMessage
		task.title = `GeoJSON data for MX: (${countB + 1}/${geoStateDataMX.length}) - ${name}`

		const { code: iso } = (state.name === 'Distrito Federal'
			? { code: 'MX-CMX' }
			: iso3166.subdivision('MX', state.name)) ?? { code: undefined }

		const distType = govDist.get(type)
		if (!distType) throw new Error('Unknown district type')

		const slug = keySlug(`MX-${state.name}`)
		const key = await nsCoC(name, 'mx')
		await prisma.govDist.upsert({
			where: {
				slug,
			},
			create: {
				name,
				slug,
				iso,
				abbrev,
				geoJSON: geo,
				country: connectTo(countryId),
				govDistType: connectTo(distType),
				key,
			},
			update: {
				name,
				iso,
				abbrev,
				geoJSON: geo,
				country: connectTo(countryId),
				govDistType: connectTo(distType),
				key,
			},
			select: { id: true },
		})
		countB++
	}
	task.title = `GeoJSON data for MX (${countB + 1} Districts)`
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
			title: 'GeoJSON data for CA',
			task: async (_ctx: unknown, task: ListrTask): Promise<void> => countryCA(task),
			options: renderOptions,
		},
		{
			title: 'GeoJSON data for MX',
			task: async (_ctx: unknown, task: ListrTask): Promise<void> => countryMX(task),
			options: renderOptions,
		},
	])
