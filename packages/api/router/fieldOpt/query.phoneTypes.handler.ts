import { prisma } from '@weareinreach/db'

export const phoneTypes = async () => {
	const result = await prisma.phoneType.findMany({
		where: { active: true },
		select: {
			id: true,
			tsKey: true,
			tsNs: true,
		},
		orderBy: { type: 'asc' },
	})
	return result
}
