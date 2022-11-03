import axios from 'axios'

import { prisma } from '~/client'

import { userEmail } from './user'

export const countryData = async () => {
	const { data: countries } = await axios.get<Array<Countries>>(
		'https://restcountries.com/v3.1/all?fields=name,translations,cca3,flag,idd'
	)

	const languageList = await prisma.language.findMany({
		where: {
			iso6392: {
				not: null,
			},
		},
		select: {
			id: true,
			iso6392: true,
			localeCode: true,
		},
	})

	const { id: userId } = await prisma.user.findUniqueOrThrow({
		where: {
			email: userEmail,
		},
		select: {
			id: true,
		},
	})
	return { countries, languageList, userId }
}

export interface Countries {
	name: Name
	cca3: string
	translations: { [key: string]: Translation }
	flag: string
	idd: Idd
}

interface Name {
	common: string
	official: string
	nativeName: { [key: string]: Translation }
}

interface Translation {
	official: string
	common: string
}
interface Idd {
	root: string
	suffixes: string[]
}
