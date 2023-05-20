import { type Prisma } from '@weareinreach/db'

const common = { id: true, tsKey: true, tsNs: true }

const subDistrictSelect = {
	...common,
	govDistType: {
		select: { tsKey: true, tsNs: true },
	},
} satisfies Prisma.GovDistSelect

export const serviceAreaSelect = (subDistrictLevels: 0 | 1 | 2) =>
	({
		...common,
		cca2: true,
		flag: true,
		govDist: {
			where: { isPrimary: true },
			select: {
				...common,
				abbrev: true,
				govDistType: {
					select: { tsKey: true, tsNs: true },
				},
				subDistricts:
					subDistrictLevels === 0
						? {}
						: {
								select: {
									...subDistrictSelect,
									subDistricts:
										subDistrictLevels === 1
											? {}
											: {
													select: subDistrictSelect,
													orderBy: { name: 'asc' },
											  },
								},
								orderBy: { name: 'asc' },
						  },
			},
			orderBy: { name: 'asc' },
		},
	} satisfies Prisma.CountrySelect)
