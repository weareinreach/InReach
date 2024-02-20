import { prisma } from '@weareinreach/db'

export const getFilterOptions = async () => {
	const result = await prisma.serviceCategory.findMany({
		where: {
			active: true,
			OR: [{ crisisSupportOnly: null }, { crisisSupportOnly: false }],
		},
		select: {
			id: true,
			tsKey: true,
			tsNs: true,
			services: {
				where: {
					active: true,
				},
				select: {
					serviceTag: {
						select: {
							id: true,
							tsKey: true,
							tsNs: true,
						},
					},
				},
				orderBy: {
					serviceTag: {
						name: 'asc',
					},
				},
			},
		},
		orderBy: {
			category: 'asc',
		},
	})
	const transformed = result.map(({ services, ...rest }) => ({
		...rest,
		services: services.map(({ serviceTag }) => serviceTag),
	}))
	return transformed
}
export default getFilterOptions
