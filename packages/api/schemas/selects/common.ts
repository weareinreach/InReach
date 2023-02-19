import { Prisma } from '@weareinreach/db'

export const isPublic = {
	published: true,
	deleted: false,
}

export const freeText = {
	select: {
		key: true,
		ns: true,
	},
} satisfies Prisma.FreeTextArgs

export const countryWithoutGeo = {
	select: {
		cca2: true,
		cca3: true,
		id: true,
		name: true,
		dialCode: true,
		flag: true,
		tsKey: true,
		tsNs: true,
		demonymKey: true,
		demonymNs: true,
	},
}
export const govDistWithoutGeo = {
	select: {
		id: true,
		name: true,
		slug: true,
		iso: true,
		abbrev: true,
		country: countryWithoutGeo,
		govDistType: true,
		isPrimary: true,
		tsKey: true,
		tsNs: true,
		parent: {
			select: {
				id: true,
				name: true,
				slug: true,
				iso: true,
				abbrev: true,
				country: countryWithoutGeo,
				govDistType: true,
				isPrimary: true,
				tsKey: true,
				tsNs: true,
			},
		},
	},
}

export const attributes = {
	select: {
		attribute: {
			include: {
				categories: {
					select: {
						category: true,
					},
				},
			},
		},
		supplement: {
			include: {
				country: countryWithoutGeo,
				language: true,
				text: true,
			},
		},
	},
}
