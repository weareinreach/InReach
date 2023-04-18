import { Prisma } from '@weareinreach/db'

const common = { id: true, tsKey: true, tsNs: true }

const subDistrictSelect = {
	...common,
	govDistType: {
		select: { tsKey: true, tsNs: true },
	},
} satisfies Prisma.GovDistSelect

export const serviceAreaSelect = {
	...common,
	cca2: true,
	govDist: {
		where: { isPrimary: true },
		select: {
			...common,
			abbrev: true,
			govDistType: {
				select: { tsKey: true, tsNs: true },
			},
			subDistricts: {
				select: {
					...subDistrictSelect,
					subDistricts: {
						select: subDistrictSelect,
						orderBy: { name: 'asc' },
					},
				},
				orderBy: { name: 'asc' },
			},
		},
		orderBy: { name: 'asc' },
	},
} satisfies Prisma.CountrySelect
