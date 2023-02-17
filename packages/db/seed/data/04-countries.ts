/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prisma } from '@prisma/client'
import axios from 'axios'
import { countries as countryExtra } from 'countries-languages'

import { namespaces } from '~db/seed/data/00-namespaces'
import { TranslationPluralSchema } from '~db/zod_util/translationPlurals'

export const countryData = async () => {
	const { data: countries } = await axios.get<Array<Countries>>(
		'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,flag,idd'
	)

	return { countries }
}

export const genDemonymKey = (country: Countries) => {
	const demonym: string | undefined = countryExtra[country.cca2]?.demonym
	if (demonym) {
		const { plural, pluralValues } = TranslationPluralSchema.parse({
			plural: 'PLURAL',
			pluralValues: {
				one: demonym,
				other: demonym,
			},
		})

		const newKey = {
			key: `${country.cca3}.demonym`,
			ns: namespaces.country,
			text: demonym,
			context: `Citizens of ${country.name.common}`,
			plural,
			pluralValues,
		} satisfies Prisma.TranslationKeyCreateManyInput

		return newKey
	}

	return undefined
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
