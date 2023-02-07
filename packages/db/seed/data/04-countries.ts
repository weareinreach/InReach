/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import axios from 'axios'
// @ts-ignore
import { countries as countryExtra } from 'countries-languages'

import { namespaces } from '~db/seed/data/00-namespaces'

export const countryData = async () => {
	const { data: countries } = await axios.get<Array<Countries>>(
		'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,flag,idd'
	)

	return { countries }
}

export const genDemonymKey = (country: Countries) => {
	const demonym: string | undefined = countryExtra[country.cca2]?.demonym
	if (demonym) {
		return {
			demonymOne: {
				key: `${country.cca3}.demonym_one`,
				ns: namespaces.country,
				text: demonym,
				context: `Citizens of ${country.name.common}`,
			},

			demonymOther: {
				key: `${country.cca3}.demonym_other`,
				text: `${demonym}s`,
				ns: namespaces.country,
				parentKey: `${country.cca3}.demonym_one`,
				parentNs: namespaces.country,
			},
		}
	}

	return {
		demonymOne: undefined,
		// {
		// 	key: undefined,
		// 	ns: undefined,
		// 	text: undefined,
		// 	context: undefined,
		// },

		demonymOther: undefined,
		// {
		// 	key: undefined,
		// 	text: undefined,
		// 	ns: undefined,
		// 	parentKey: undefined,
		// 	parentNs: undefined,
		// },
	}
}

export interface Countries {
	name: Name
	cca2: string
	cca3: string
	flag: string
	idd: Idd
}

interface Name {
	common: string
	official: string
}

interface Idd {
	root: string
	suffixes: string[]
}
