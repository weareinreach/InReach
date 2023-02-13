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

import cityCA from '~db/datastore/geojson/cities-ca.json'
import cityMX from '~db/datastore/geojson/cities-mx.json'
import cityUS from '~db/datastore/geojson/cities-us.json'
import countyPR from '~db/datastore/geojson/counties-pr.json'
import countyUS from '~db/datastore/geojson/counties-us.json'
import countryCA from '~db/datastore/geojson/country-ca.json'
import countryGU from '~db/datastore/geojson/country-gu.json'
import countryMX from '~db/datastore/geojson/country-mx.json'
import countryPR from '~db/datastore/geojson/country-pr.json'
import countryUS from '~db/datastore/geojson/country-us.json'
import countryVI from '~db/datastore/geojson/country-vi.json'
import provinceCA from '~db/datastore/geojson/provinces-ca.json'
import stateMX from '~db/datastore/geojson/states-mx.json'
import stateUS from '~db/datastore/geojson/states-us.json'
import { Geometry } from '~db/zod_util'

export const geoCountryData = {
	US: Geometry.parse(countryUS.geometry),
	CA: Geometry.parse(countryCA.geometry),
	MX: Geometry.parse(countryMX.geometry),
	PR: Geometry.parse(countryPR.geometry),
	VI: Geometry.parse(countryVI.geometry),
	GU: Geometry.parse(countryGU.geometry),
}

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
