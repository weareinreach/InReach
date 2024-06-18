import { PrismaEnums } from '@weareinreach/db'

export const formatAddressVisiblity = (location: ProvidedAddress) => {
	const address: ReformattedAddress = {
		street1: location.street1,
		street2: location.street2,
		city: location.city,
		postCode: location.postCode,
		govDist: location.govDist,
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
		case PrismaEnums.AddressVisibility.HIDDEN: {
			address.street1 = null
			address.street2 = null
			address.city = null
			address.postCode = null
			address.govDist = null
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
}
type ProvidedAddress = Omit<ReformattedAddress, 'city'> & {
	city: string
	addressVisibility: PrismaEnums.AddressVisibility
} & Record<string, unknown>
