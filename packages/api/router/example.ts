import { z } from 'zod'

import { publicProcedure, router } from '~/lib/trpc'

export const exampleRouter = router({
	hello: publicProcedure.input(z.object({ text: z.string().nullish() }).nullish()).query(({ input }) => {
		return {
			greeting: `Hello ${input?.text ?? 'world'}`,
		}
	}),
	getAll: publicProcedure.query(({ ctx }) => {
		return ctx.prisma.user.findMany()
	}),
})
