import { protectedProcedure, publicProcedure, router } from '../trpc'

export const authRouter = router({
	getSession: publicProcedure.query(({ ctx }) => {
		return ctx.session
	}),
	getSecretMessage: protectedProcedure.query(() => {
		return 'You are logged in and can see this secret message!'
	}),
})
