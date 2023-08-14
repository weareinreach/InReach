import { prisma } from '@weareinreach/db'

export const userTitle = async () => {
	const results = await prisma.userTitle.findMany({
		where: { searchable: true },
		select: { id: true, title: true },
	})
	return results
}
