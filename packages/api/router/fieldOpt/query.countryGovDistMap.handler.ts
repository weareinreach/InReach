import { prisma } from '@weareinreach/db'

export const countryGovDistMap = async () => {
	const fields = { id: true, tsKey: true, tsNs: true }

	const countries = await prisma.country.findMany({
		where: { activeForOrgs: true },
		select: {
			...fields,
			govDist: { select: fields },
		},
	})
	const govDists = await prisma.govDist.findMany({
		select: {
			...fields,
			subDistricts: {
				select: fields,
			},
			parent: { select: fields },
			country: { select: fields },
		},
	})
	const resultMap = new Map<string, CountryGovDistMapItem>([
		...(countries.map(({ govDist, ...rest }) => [rest.id, { ...rest, children: govDist }]) satisfies [
			string,
			CountryGovDistMapItem,
		][]),
		...(govDists.map(({ subDistricts, parent, country, ...rest }) => [
			rest.id,
			{ ...rest, children: subDistricts, parent: parent ? { ...parent, parent: country } : country },
		]) satisfies [string, CountryGovDistMapItem][]),
	])
	return resultMap
}

interface CountryGovDistMapItemBasic {
	id: string
	tsKey: string
	tsNs: string
}

interface CountryGovDistMapItem {
	id: string
	tsKey: string
	tsNs: string
	children: CountryGovDistMapItemBasic[]
	parent?: CountryGovDistMapItemBasic & { parent?: CountryGovDistMapItemBasic }
}
