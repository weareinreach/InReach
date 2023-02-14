import { defineRouter, publicProcedure } from '~api/lib/trpc'

export const authRouter = defineRouter({
	getSession: publicProcedure.query(({ ctx }) => {
		return ctx.session
	}),
})
