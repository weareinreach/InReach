import { prisma } from '@weareinreach/db'

export const getOptions = async () => {
	const result = await prisma.serviceTag.findMany({
		select: {
			id: true,
			active: true,
			tsKey: true,
			tsNs: true,
			primaryCategory: {
				select: {
					id: true,
					active: true,
					tsKey: true,
					tsNs: true,
				},
			},
		},
	})
	return result
}
export default getOptions
