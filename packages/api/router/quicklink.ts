import { defineRouter, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

const phoneSelect = {
	select: {
		phone: {
			select: {
				id: true,
				number: true,
				description: { select: { tsKey: { select: { text: true } } } },
				country: { select: { id: true, cca2: true } },
				locationOnly: true,
				serviceOnly: true,
			},
		},
	},
}

export const quickLinkRouter = defineRouter({
	getPhoneData: /*permissionedProcedure('updateLocation')*/ publicProcedure.query(async ({ ctx }) => {
		const data = await ctx.prisma.organization.findMany({
			where: {
				published: true,
				deleted: false,
				locations: { some: { phones: { none: {} } } },
			},
			select: {
				id: true,
				name: true,
				locations: {
					select: {
						id: true,
						name: true,
						phones: phoneSelect,
					},
				},
				phones: phoneSelect,
				services: {
					select: {
						id: true,
						description: { select: { tsKey: { select: { text: true } } } },
						phones: phoneSelect,
					},
				},
			},

			take: 10,
		})
		return data
	}),
})
