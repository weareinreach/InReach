import parsePhone, { type CountryCode, getCountries } from 'libphonenumber-js'

const isCountryCode = (countryCode: string): countryCode is CountryCode => {
	const codes = getCountries() as string[]
	return codes.includes(countryCode)
}

export const parsePhoneNumber = (phoneNumber: string, countryCode: string = 'US') => {
	const country = countryCode.toUpperCase()
	if (!isCountryCode(country))
		throw new Error('Invalid country', {
			cause: { passed: countryCode, parsed: country, acceptableOptions: getCountries() },
		})

	return parsePhone(phoneNumber, country)
}

export const usePhoneNumber = (phoneNumber: string, countryCode: string = 'US') =>
	parsePhoneNumber(phoneNumber, countryCode)
