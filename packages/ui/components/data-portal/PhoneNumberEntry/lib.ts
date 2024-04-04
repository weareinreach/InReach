import { type ApiOutput } from '@weareinreach/api'

export const topCountries = ['US', 'CA', 'MX']

export const transformCountryList = (data: ApiOutput['fieldOpt']['countries']) =>
	data
		.map(({ id, flag, name, cca2 }) => ({
			value: id,
			label: `${flag}`,
			data: { name, cca2 },
			group: topCountries.includes(cca2) ? 'Common' : 'Others',
		}))
		.sort((a, b) => {
			if (topCountries.includes(a.data.cca2) && !topCountries.includes(b.data.cca2)) {
				return -1
			} else if (topCountries.includes(b.data.cca2) && !topCountries.includes(a.data.cca2)) {
				return 1
			} else {
				return a.data.cca2.localeCompare(b.data.cca2)
			}
		})
