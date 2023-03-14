/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import checkgeo from '@placemarkio/check-geojson'

import msc from '@nuskin/mexico-state-lookup'
import { geoStateIso } from '@zerodep/geo.stateiso'
import iso3166 from 'iso-3166-2'
import shoetest from 'shoetest'
import invariant from 'tiny-invariant'

import fs from 'fs'
import path from 'path'

// import cityCA from '~db/seed/data/downloaded/cities-ca.json'
// import cityMX from '~db/seed/data/downloaded/cities-mx.json'
// import cityUS from '~db/seed/data/downloaded/cities-us.json'
// import countyPR from '~db/seed/data/downloaded/counties-pr.json'
// import countyUS from '~db/seed/data/downloaded/counties-us.json'
// import countryCA from '~db/seed/data/downloaded/country-ca.json'
// import countryGU from '~db/seed/data/downloaded/country-gu.json'
// import countryMX from '~db/seed/data/downloaded/country-mx.json'
// import countryPR from '~db/seed/data/downloaded/country-pr.json'
// import countryUS from '~db/seed/data/downloaded/country-us.json'
// import countryVI from '~db/seed/data/downloaded/country-vi.json'
// import provinceCA from '~db/seed/data/downloaded/provinces-ca.json'
// import stateMX from '~db/seed/data/downloaded/states-mx.json'
// import stateUS from '~db/seed/data/downloaded/states-us.json'
import {
	CityCAData,
	CityMXData,
	CityUSData,
	CountyPRData,
	CountyUSData,
	Geometry,
	GeometryJSONfile,
	ProvinceCAData,
	StateMXData,
	StateUSData,
} from '~db/zod_util'

const files = {
	cityCA: path.resolve(__dirname, 'downloaded/cities-ca.json'),
	cityMX: path.resolve(__dirname, 'downloaded/cities-mx.json'),
	cityUS: path.resolve(__dirname, 'downloaded/cities-us.json'),
	countyPR: path.resolve(__dirname, 'downloaded/counties-pr.json'),
	countyUS: path.resolve(__dirname, 'downloaded/counties-us.json'),
	countryCA: path.resolve(__dirname, 'downloaded/country-ca.json'),
	countryGU: path.resolve(__dirname, 'downloaded/country-gu.json'),
	countryMX: path.resolve(__dirname, 'downloaded/country-mx.json'),
	countryPR: path.resolve(__dirname, 'downloaded/country-pr.json'),
	countryUS: path.resolve(__dirname, 'downloaded/country-us.json'),
	countryVI: path.resolve(__dirname, 'downloaded/country-vi.json'),
	provinceCA: path.resolve(__dirname, 'downloaded/provinces-ca.json'),
	stateMX: path.resolve(__dirname, 'downloaded/states-mx.json'),
	stateUS: path.resolve(__dirname, 'downloaded/states-us.json'),
} as const

const readJson = (file: string) => JSON.parse(fs.readFileSync(file, 'utf-8'))

export const geoCountryData = {
	US: GeometryJSONfile.parse(readJson(files.countryUS)),
	CA: GeometryJSONfile.parse(readJson(files.countryCA)),
	MX: GeometryJSONfile.parse(readJson(files.countryMX)),
	PR: GeometryJSONfile.parse(readJson(files.countryPR)),
	VI: GeometryJSONfile.parse(readJson(files.countryVI)),
	GU: GeometryJSONfile.parse(readJson(files.countryGU)),
}

const cityCA = CityCAData.parse(readJson(files.cityCA))
const cityMX = CityMXData.parse(readJson(files.cityMX))
const cityUS = CityUSData.parse(readJson(files.cityUS))
const countyPR = CountyPRData.parse(readJson(files.countyPR))
const countyUS = CountyUSData.parse(readJson(files.countyUS))
const provinceCA = ProvinceCAData.parse(readJson(files.provinceCA))
const stateMX = StateMXData.parse(readJson(files.stateMX))
const stateUS = StateUSData.parse(readJson(files.stateUS))

export const geoProvinceDataCA = provinceCA.features
	.map((province) => {
		const cities = cityCA.features.filter(
			(city) => city.properties.province_id === geoStateIso(province.properties.prov_name_en)
		)

		const type = iso3166.subdivision('CA', province.properties.prov_name_en)?.type
		invariant(type)

		return {
			name: province.properties.prov_name_en,
			abbrev: geoStateIso(province.properties.prov_name_en, 'CA'),
			type,
			geo: Geometry.parse(province.geometry),
			cities: cities.map((city) => Geometry.parse(city.geometry)),
		}
	})
	.sort((x: { name: string }, y: { name: string }) => (x.name > y.name ? 1 : y.name > x.name ? -1 : 0))

export const geoStateDataUS = stateUS.features
	.map((state) => {
		const abbrev = geoStateIso(state.properties.NAME)
		const cities = cityUS.features.filter((city) => city.properties['country.etc'] === abbrev)
		const type = iso3166.subdivision('US', state.properties.NAME)?.type
		invariant(abbrev && type)

		return {
			name: state.properties.NAME,
			geo: Geometry.parse(state.geometry),
			abbrev,
			type,
			counties: countyUS.features.filter((county) => county.properties.STATE === state.properties.STATE),
			cities: cities.map((city) => {
				const regex = new RegExp(`/\\s${abbrev}$/`)
				city.properties.name = city.properties.name.replace(regex, '')
				return Geometry.parse(city.geometry)
			}),
		}
	})
	.sort((x: { name: string }, y: { name: string }) => (x.name > y.name ? 1 : y.name > x.name ? -1 : 0))

export const geoStateDataMX = stateMX.features
	.map((state) => {
		const abbrev =
			state.properties.admin_name === 'Distrito Federal'
				? 'D.F.'
				: msc.byName(state.properties.admin_name).abbreviation[0]
		const cities = cityMX.features.filter((city) => {
			if (
				state.properties.admin_name === 'Distrito Federal' &&
				city.properties.admin_name === 'Ciudad de México'
			)
				return true
			return shoetest.test(city.properties.admin_name, state.properties.admin_name)
		})
		const type =
			state.properties.admin_name === 'Distrito Federal' ? ('district' as const) : ('state' as const)
		return {
			name: state.properties.admin_name,
			geo: Geometry.parse(state.geometry),
			type,
			abbrev,
			cities: cities.map((city) => Geometry.parse(city.geometry)),
		}
	})
	.sort((x: { name: string }, y: { name: string }) => (x.name > y.name ? 1 : y.name > x.name ? -1 : 0))

export const geoCountyDataPR = countyPR.features.map((county) => county)
