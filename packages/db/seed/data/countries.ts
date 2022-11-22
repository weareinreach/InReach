import axios from 'axios'

export const countryData = async () => {
	const { data: countries } = await axios.get<Array<Countries>>(
		'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,flag,idd'
	)

	return { countries }
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
