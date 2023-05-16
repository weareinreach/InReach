import parsePhone, { type CountryCode, getCountries, isSupportedCountry } from 'libphonenumber-js'

/**
 * Type guard function checks if a given string is a supported country code and returns a boolean value. All
 * instances of the `countryCode` param passed will be typed as `CountryCode` if a `true` result is returned.
 *
 * @param {string} countryCode - A string representing a ISO 3166-2 (two letter) country code.
 */
export const isCountryCode = (countryCode: string): countryCode is CountryCode =>
	isSupportedCountry(countryCode)

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
