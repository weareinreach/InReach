import parsePhone, { type CountryCode, getCountries, isSupportedCountry } from 'libphonenumber-js'

const isCountryCode = (countryCode: string): countryCode is CountryCode => isSupportedCountry(countryCode)

export const parsePhoneNumber = (phoneNumber: string, countryCode = 'US') => {
	const country = countryCode.toUpperCase()
	if (!isCountryCode(country))
		throw new Error('Invalid country', {
			cause: { passed: countryCode, parsed: country, acceptableOptions: getCountries() },
		})

	return parsePhone(phoneNumber, country)
}

export const usePhoneNumber = (phoneNumber: string, countryCode = 'US') =>
	parsePhoneNumber(phoneNumber, countryCode)
