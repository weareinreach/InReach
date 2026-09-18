import parsePhone, {
	type CountryCode,
	type Extension,
	getCountries,
	isSupportedCountry,
} from 'libphonenumber-js'

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
	if (!isCountryCode(country)) {
		throw new Error('Invalid country', {
			cause: { passed: countryCode, parsed: country, acceptableOptions: getCountries() },
		})
	}

	return parsePhone(phoneNumber, country)
}

export const usePhoneNumber = (phoneNumber: string, countryCode = 'US') =>
	parsePhoneNumber(phoneNumber, countryCode)

export const isExtension = (ext: string | null): ext is Extension => typeof ext === 'string' && ext.length > 0

const NANP_TOLL_FREE_AREA_CODES = new Set(['800', '833', '844', '855', '866', '877', '888'])

/**
 * NANP toll-free numbers (800, 888, etc.) route by carrier tables, not geography - they aren't owned by any
 * single country in the North American Numbering Plan (US, Canada, and several Caribbean nations all share
 * calling code +1). `libphonenumber-js`'s country detection for these either picks an arbitrary NANP member
 * or returns nothing at all, so it can't be trusted for country auto-detection or "is this country enabled"
 * validation the way a real geographic area code can.
 */
export const isNanpTollFreeNumber = (phoneNumber: string) => {
	const parsed = parsePhone(phoneNumber)
	return (
		parsed?.countryCallingCode === '1' && NANP_TOLL_FREE_AREA_CODES.has(parsed.nationalNumber.slice(0, 3))
	)
}
