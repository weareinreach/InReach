import { Prisma } from '@weareinreach/db'

export const isPublic = {
	published: true,
	deleted: false,
}

export const freeText = {
	select: {
		key: true,
		ns: true,
		tsKey: {
			select: {
				text: true,
			},
		},
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
		govDistType: {
			select: {
				tsKey: true,
				tsNs: true,
			},
		},
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
				govDistType: {
					select: {
						tsKey: true,
						tsNs: true,
					},
				},
				isPrimary: true,
				tsKey: true,
				tsNs: true,
			},
		},
	},
}

export const attributes = {
	where: {
		attribute: {
			active: true,
			categories: {
				some: {
					category: {
						active: true,
					},
				},
			},
		},
	},
	select: {
		attribute: {
			select: {
				id: true,
				tsKey: true,
				tsNs: true,
				icon: true,
				iconBg: true,
				showOnLocation: true,
				categories: {
					select: {
						category: {
							select: {
								tag: true,
								icon: true,
							},
						},
					},
				},
			},
		},
		supplement: {
			select: {
				id: true,
				country: countryWithoutGeo,
				language: {
					select: {
						languageName: true,
						nativeName: true,
					},
				},
				text: freeText,
				govDist: govDistWithoutGeo,
				boolean: true,
				data: true,
			},
		},
	},
} satisfies Prisma.OrgService$attributesArgs

export const languageNames = { select: { languageName: true, nativeName: true } }

export const phoneSelectPublic = {
	where: {
		phone: isPublic,
	},
	select: {
		phone: {
			select: {
				country: countryWithoutGeo,
				phoneLangs: {
					select: {
						language: languageNames,
					},
				},
				phoneType: {
					select: {
						tsKey: true,
						tsNs: true,
					},
				},
				number: true,
				ext: true,
				primary: true,
				locationOnly: true,
			},
		},
	},
} satisfies Prisma.OrgService$phonesArgs
