import { formatAddress } from 'localized-address-format'
import { useTranslation } from 'next-i18next'
import { z } from 'zod'
import { ApiOutput } from '@weareinreach/api'

const AddressSchema = z.object({
	street1: z.string(),
	street2: z.string().nullish(),
	city: z.string(),
	postCode: z.string().nullish(),
	country: z.object({
		cca2: z.string(),
	}),
	govDist: z.object({
		abbrev: z.string().nullish(),
		tsKey: z.string(),
		tsNs: z.string(),
	}),
})

export const useFormattedAddressParts = (location?: UseFormattedAddressProps) => {
	const { t } = useTranslation()
	const addressParts = AddressSchema.safeParse(location)
	if (!addressParts.success) return null

	const parsedLocation = addressParts.data
	const adminArea = parsedLocation.govDist?.abbrev
		? parsedLocation.govDist.abbrev
		: parsedLocation.govDist?.tsKey
		? (t(parsedLocation.govDist.tsKey, { ns: parsedLocation.govDist.tsNs }) as string)
		: undefined
	const formattedAddress = formatAddress({
		addressLines: parsedLocation.street2
			? [parsedLocation.street1.trim(), parsedLocation.street2.trim()]
			: [parsedLocation.street1.trim()],
		locality: parsedLocation.city.trim(),
		postalCode: parsedLocation.postCode ? parsedLocation.postCode.trim() : undefined,
		postalCountry: parsedLocation.country.cca2,
		administrativeArea: adminArea,
	})

	return formattedAddress
}
export const useFormattedAddress = (location?: UseFormattedAddressProps) => {
	const address = useFormattedAddressParts(location)
	if (Array.isArray(address)) return address.join(', ')
	return address
}

export type UseFormattedAddressProps = Partial<
	NonNullable<ApiOutput['organization']['getBySlug']>['locations'][number]
>
