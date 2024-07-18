import { PrismaEnums } from '@weareinreach/db'

export const formatAddressVisiblity = (location: ProvidedAddress, isEditMode = false) => {
	const address: ReformattedAddress = {
		street1: location.street1,
		street2: location.street2,
		city: location.city,
		postCode: location.postCode,
		govDist: location.govDist,
		latitude: location.latitude,
		longitude: location.longitude,
	}
	switch (location.addressVisibility) {
		case PrismaEnums.AddressVisibility.FULL: {
			return address
		}
		case PrismaEnums.AddressVisibility.PARTIAL: {
			address.street1 = null
			address.street2 = null
			return address
		}
		case PrismaEnums.AddressVisibility.HIDDEN:
		default: {
			address.street1 = null
			address.street2 = null
			address.postCode = null
			address.latitude = null
			address.longitude = null
			if (!isEditMode) {
				address.city = null
				address.govDist = null
			}
			return address
		}
	}
}

type ReformattedAddress = {
	street1: string | null
	street2: string | null
	city: string | null
	postCode: string | null
	govDist: {
		tsKey: string
		tsNs: string
		abbrev: string | null
	} | null
	latitude: number | null
	longitude: number | null
}
type ProvidedAddress = Omit<ReformattedAddress, 'city'> & {
	city: string
	addressVisibility: PrismaEnums.AddressVisibility
} & Record<string, unknown>
