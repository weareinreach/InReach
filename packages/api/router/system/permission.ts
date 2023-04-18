import { z } from 'zod'

import { handleError } from '~api/lib'
import { defineRouter, permissionedProcedure } from '~api/lib/trpc'
import { CreateNew } from '~api/schemas/system/permissions'

export const permissionSubRouter = defineRouter({
	new: permissionedProcedure('createPermission')
		.input(CreateNew().inputSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const { actorId } = ctx
				const { dataParser } = CreateNew()

				const inputData = {
					actorId,
					data: input,
					operation: 'CREATE',
				} satisfies z.input<typeof dataParser>
				const data = dataParser.parse(inputData)

				const result = await ctx.prisma.permission.create(data)
				return result
			} catch (error) {
				handleError(error)
			}
		}),
})
