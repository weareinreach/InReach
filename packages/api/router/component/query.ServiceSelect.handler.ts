import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

export const ServiceSelect = async ({ ctx }: TRPCHandlerParams<undefined>) => {
	try {
		const result = await prisma.serviceCategory.findMany({
			where: {
				active: true,
				OR: [{ crisisSupportOnly: null }, { crisisSupportOnly: false }],
			},
			select: {
				// id: true,
				tsKey: true,
				// tsNs: true,
				services: {
					where: {
						active: true,
					},
					select: {
						serviceTag: {
							select: {
								id: true,
								tsKey: true,
								// tsNs: true,
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
	} catch (error) {
		handleError(error)
	}
}

export default ServiceSelect
