import { z } from 'zod'

import { defineRouter, publicProcedure } from '~/lib/trpc'

export const exampleRouter = defineRouter({
	hello: publicProcedure.input(z.object({ text: z.string().nullish() }).nullish()).query(({ input }) => {
		return {
			greeting: `Hello ${input?.text ?? 'world'}`,
		}
	}),
	getAll: publicProcedure.query(({ ctx }) => {
		return ctx.prisma.user.findMany()
	}),
})
