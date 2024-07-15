import compact from 'just-compact'
import { formatAddress } from 'localized-address-format'
import { type TFunction, useTranslation } from 'next-i18next'
import { useCallback } from 'react'
import { z } from 'zod'

import { type ApiOutput } from '@weareinreach/api'

const AddressSchema = z.object({
	street1: z.string().nullish(),
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
type ParsedAddress = z.infer<typeof AddressSchema>

const getAdminArea = (location: ParsedAddress, t: TFunction) => {
	if (location.govDist.abbrev) {
		return location.govDist.abbrev
	}
	if (location.govDist.tsKey) {
		return t(location.govDist.tsKey, { ns: location.govDist.tsNs })
	}
	return undefined
}

export const useFormattedAddressParts = (location?: UseFormattedAddressProps | null) => {
	const { t } = useTranslation('gov-dist')
	const addressParts = AddressSchema.safeParse(location)
	if (!addressParts.success) {
		return null
	}

	const parsedLocation = addressParts.data
	const adminArea = getAdminArea(parsedLocation, t)
	const formattedAddress = formatAddress({
		addressLines: compact([parsedLocation.street1?.trim(), parsedLocation.street2?.trim()]),
		locality: parsedLocation.city.trim(),
		postalCode: parsedLocation.postCode?.trim() ?? undefined,
		postalCountry: parsedLocation.country.cca2,
		administrativeArea: adminArea,
	})

	return formattedAddress
}
export const useFormattedAddress = (location?: UseFormattedAddressProps | null) => {
	const address = useFormattedAddressParts(location)
	if (Array.isArray(address)) {
		return address.join(', ')
	}
	return address
}

export const useAddressFormatter = () => {
	const { t } = useTranslation('gov-dist')
	const formatDbItem = useCallback(
		(location?: UseFormattedAddressProps | null) => {
			const addressParts = AddressSchema.safeParse(location)
			if (!addressParts.success) {
				return null
			}

			const parsedLocation = addressParts.data
			const adminArea = getAdminArea(parsedLocation, t)
			const formattedAddress = formatAddress({
				addressLines: compact([parsedLocation.street1?.trim(), parsedLocation.street2?.trim()]),
				locality: parsedLocation.city.trim(),
				postalCode: parsedLocation.postCode?.trim() ?? undefined,
				postalCountry: parsedLocation.country.cca2,
				administrativeArea: adminArea,
			})

			return formattedAddress
		},
		[t]
	)

	return { formatDbItem, format: formatAddress }
}

export type UseFormattedAddressProps = Partial<
	| NonNullable<ApiOutput['organization']['forOrgPage']>['locations'][number]
	| NonNullable<ApiOutput['location']['forVisitCard']>
>
