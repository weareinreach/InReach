import { defineRouter, publicProcedure } from '../lib/trpc'

export const authRouter = defineRouter({
	getSession: publicProcedure.query(({ ctx }) => {
		return ctx.session
	}),
})
