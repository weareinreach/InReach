import msc from '@nuskin/mexico-state-lookup'
// import checkgeo from '@placemarkio/check-geojson'
import { geoStateIso } from '@zerodep/geo.stateiso'
import iso3166 from 'iso-3166-2'
import shoetest from 'shoetest'

import cityCA from '~/datastore/geojson/cities-ca.json'
import cityMX from '~/datastore/geojson/cities-mx.json'
import cityUS from '~/datastore/geojson/cities-us.json'
import countyUS from '~/datastore/geojson/counties-us.json'
import countryCA from '~/datastore/geojson/country-ca.json'
import countryMX from '~/datastore/geojson/country-mx.json'
import countryUS from '~/datastore/geojson/country-us.json'
import provinceCA from '~/datastore/geojson/provinces-ca.json'
import stateMX from '~/datastore/geojson/states-mx.json'
import stateUS from '~/datastore/geojson/states-us.json'
import { GeoJSONSchema } from '~/zod-util'

export const geoCountryData = {
	US: GeoJSONSchema.parse(countryUS),
	CA: GeoJSONSchema.parse(countryCA),
	MX: GeoJSONSchema.parse(countryMX),
}

export const geoProvinceDataCA = provinceCA.features
	.map((province) => {
		const cities = cityCA.features.filter(
			(city) => city.properties.province_id === geoStateIso(province.properties.prov_name_en)
		)
		return {
			name: province.properties.prov_name_en,
			abbrev: geoStateIso(province.properties.prov_name_en),
			type: iso3166.subdivision('CA', province.properties.prov_name_en).type,
			geo: GeoJSONSchema.parse(province),
			cities: cities.map((city) => GeoJSONSchema.parse(city)),
		}
	})
	.sort((x: { name: string }, y: { name: string }) => (x.name > y.name ? 1 : y.name > x.name ? -1 : 0))

export const geoStateDataUS = stateUS.features
	.map((state) => {
		const abbrev = geoStateIso(state.properties.NAME)
		const cities = cityUS.features.filter((city) => city.properties['country.etc'] === abbrev)
		return {
			name: state.properties.NAME,
			geo: GeoJSONSchema.parse(state),
			abbrev,
			type: iso3166.subdivision('US', state.properties.NAME).type,
			counties: countyUS.features.filter((county) => county.properties.STATE === state.properties.STATE),
			cities: cities.map((city) => {
				const regex = new RegExp(`/\\s${abbrev}$/`)
				city.properties.name = city.properties.name.replace(regex, '')
				return GeoJSONSchema.parse(city)
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
			geo: GeoJSONSchema.parse(state),
			type,
			abbrev,
			cities: cities.map((city) => GeoJSONSchema.parse(city)),
		}
	})
	.sort((x: { name: string }, y: { name: string }) => (x.name > y.name ? 1 : y.name > x.name ? -1 : 0))
