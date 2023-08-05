import { type Prisma } from '@weareinreach/db'

export const globalSelect = {
	freeText(): Prisma.FreeTextDefaultArgs {
		return {
			select: {
				key: true,
				ns: true,
				tsKey: {
					select: {
						text: true,
					},
				},
			},
		}
	},
}

export const globalWhere = {
	isPublic() {
		return {
			published: true,
			deleted: false,
		} as const
	},
}
