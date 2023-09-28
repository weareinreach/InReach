import {
	findPhoneNumbersInText,
	isSupportedCountry,
	parsePhoneNumber,
	parsePhoneNumberFromString,
	searchPhoneNumbersInText,
} from 'libphonenumber-js'

import fs from 'fs'
import path from 'path'

import { prisma } from '~db/client'

function lettersToPhoneNumber(input: string) {
	// convert lowercase string to uppercase since we compare against uppercase;
	// then split string into an array of letters;
	const searchStr = input.toUpperCase().split('')

	// create virtual keypad, associating alpha characters with a single digit;
	const keyPads = [
		{
			alpha: ['A', 'B', 'C'],
			digit: 2,
		},
		{
			alpha: ['D', 'E', 'F'],
			digit: 3,
		},
		{
			alpha: ['G', 'H', 'I'],
			digit: 4,
		},
		{
			alpha: ['J', 'K', 'L'],
			digit: 5,
		},
		{
			alpha: ['M', 'N', 'O'],
			digit: 6,
		},
		{
			alpha: ['P', 'Q', 'R', 'S'],
			digit: 7,
		},
		{
			alpha: ['T', 'U', 'V'],
			digit: 8,
		},
		{
			alpha: ['W', 'X', 'Y', 'Z'],
			digit: 9,
		},
		// {
		// 	alpha: [' '],
		// 	digit: 0,
		// },
	]

	// declare our results as an array;
	const result: (number | undefined)[] = []

	// iterate over each letter of the string
	searchStr.forEach((letter) => {
		// filters the virtual keypads for the current letter;
		// since we're creating a single digit array,
		// we immediately select [0].digit to return the digit corresponding with the letter;
		const testDigit = !isNaN(parseInt(letter))
		if (testDigit) {
			result.push(parseInt(letter))
			return
		} else if (['-', '(', ')'].includes(letter)) {
			return
		}
		const digit = keyPads.filter((keyPad) => keyPad.alpha.indexOf(letter) > -1)[0]?.digit

		// using the spread operator, we concatenate a new array;
		result.push(digit)
	})

	// we return the numbers as a number using the Array.prototype.join method nested within parseInt;
	return parseInt(result.join(''))
}

const run = async () => {
	const output: Output[] = []
	const rejected: Exception[] = []
	const exceptions: Exception[] = []
	const data = await prisma.orgPhone.findMany({
		include: {
			country: { select: { cca2: true } },
			organization: { select: { organization: { select: { name: true, id: true } } } },
			locations: { select: { location: { select: { country: { select: { cca2: true } } } } } },
		},
	})

	for (const item of data) {
		const country = isSupportedCountry(item.country.cca2) ? item.country.cca2 : undefined
		const letters2digits = lettersToPhoneNumber(item.number)
		try {
			const parsed =
				// parsePhoneNumber(item.number, country) ||
				findPhoneNumbersInText(letters2digits.toString(), { defaultCountry: country })
			if (parsed.length) {
				for (const phone of parsed) {
					if (phone.number.isValid()) {
						output.push({
							id: item.id,
							number: phone.number.nationalNumber,
							countryCode: phone.number.countryCallingCode,
						})
					} else {
						rejected.push({ id: item.id, number: phone.number.number, country: item.country.cca2 })
					}
				}
			} else {
				const parsed = parsePhoneNumber(item.number, country)
				const isValid = parsed.isValid() //isValidNumberForRegion(parsed.nationalNumber, parsed.country)
				if (parsed && isValid) {
					output.push({ id: item.id, number: parsed.nationalNumber, countryCode: parsed.countryCallingCode })
				} else {
					rejected.push({
						id: item.id,
						number: item.number,
						country: item.country.cca2,
						orgName: item.organization?.organization.name,
						orgId: item.organization?.organization.id,
						locations: item.locations.map((l) => l.location.country.cca2),
					})
				}
			}
		} catch (e) {
			console.error(e)
			const x = findPhoneNumbersInText(item.number, { defaultCountry: country })
			const letters2digits = lettersToPhoneNumber(item.number)
			rejected.push({
				id: item.id,
				number: item.number,
				country: item.country.cca2,
				orgName: item.organization?.organization.name,
				orgId: item.organization?.organization.id,
				locations: item.locations.map((l) => l.location.country.cca2),
			})
		}
	}
	for (const item of rejected) {
	}

	fs.writeFileSync(path.resolve(__dirname, './output.json'), JSON.stringify(output))
	fs.writeFileSync(path.resolve(__dirname, './exceptions.json'), JSON.stringify(rejected))
}

run()

type Output = {
	id: string
	number: string
	countryCode: string
}

type Exception = {
	id: string
	number: string
	country: string
	orgName?: string
	orgId?: string
	locations?: string[]
}
