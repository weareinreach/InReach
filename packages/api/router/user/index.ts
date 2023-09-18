import { adminProcedure, defineRouter, protectedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const HandlerCache: Partial<UserHandlerCache> = {}

type UserHandlerCache = {
	create: typeof import('./mutation.create.handler').create
	adminCreate: typeof import('./mutation.adminCreate.handler').adminCreate
	submitSurvey: typeof import('./mutation.submitSurvey.handler').submitSurvey
	getProfile: typeof import('./query.getProfile.handler').getProfile
	getPermissions: typeof import('./query.getPermissions.handler').getPermissions
	getOrgPermissions: typeof import('./query.getOrgPermissions.handler').getOrgPermissions
	getLocationPermissions: typeof import('./query.getLocationPermissions.handler').getLocationPermissions
	surveyOptions: typeof import('./query.surveyOptions.handler').surveyOptions
	forgotPassword: typeof import('./mutation.forgotPassword.handler').forgotPassword
	confirmAccount: typeof import('./mutation.confirmAccount.handler').confirmAccount
	resetPassword: typeof import('./mutation.resetPassword.handler').resetPassword
	deleteAccount: typeof import('./mutation.deleteAccount.handler').deleteAccount
}

export const userRouter = defineRouter({
	create: publicProcedure.input(schema.ZCreateSchema).mutation(async ({ ctx, input }) => {
		if (!HandlerCache.create)
			HandlerCache.create = await import('./mutation.create.handler').then((mod) => mod.create)
		if (!HandlerCache.create) throw new Error('Failed to load handler')
		return HandlerCache.create({ ctx, input })
	}),
	adminCreate: adminProcedure
		.input(schema.ZAdminCreateSchema().inputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.adminCreate)
				HandlerCache.adminCreate = await import('./mutation.adminCreate.handler').then(
					(mod) => mod.adminCreate
				)
			if (!HandlerCache.adminCreate) throw new Error('Failed to load handler')
			return HandlerCache.adminCreate({ ctx, input })
		}),
	submitSurvey: publicProcedure.input(schema.ZSubmitSurveySchema).mutation(async ({ ctx, input }) => {
		if (!HandlerCache.submitSurvey)
			HandlerCache.submitSurvey = await import('./mutation.submitSurvey.handler').then(
				(mod) => mod.submitSurvey
			)
		if (!HandlerCache.submitSurvey) throw new Error('Failed to load handler')
		return HandlerCache.submitSurvey({ ctx, input })
	}),
	getProfile: protectedProcedure.query(async ({ ctx }) => {
		if (!HandlerCache.getProfile)
			HandlerCache.getProfile = await import('./query.getProfile.handler').then((mod) => mod.getProfile)
		if (!HandlerCache.getProfile) throw new Error('Failed to load handler')
		return HandlerCache.getProfile({ ctx })
	}),
	getPermissions: protectedProcedure.query(async ({ ctx }) => {
		if (!HandlerCache.getPermissions)
			HandlerCache.getPermissions = await import('./query.getPermissions.handler').then(
				(mod) => mod.getPermissions
			)
		if (!HandlerCache.getPermissions) throw new Error('Failed to load handler')
		return HandlerCache.getPermissions({ ctx })
	}),
	getOrgPermissions: protectedProcedure.query(async ({ ctx }) => {
		if (!HandlerCache.getOrgPermissions)
			HandlerCache.getOrgPermissions = await import('./query.getOrgPermissions.handler').then(
				(mod) => mod.getOrgPermissions
			)
		if (!HandlerCache.getOrgPermissions) throw new Error('Failed to load handler')
		return HandlerCache.getOrgPermissions({ ctx })
	}),
	getLocationPermissions: protectedProcedure.query(async ({ ctx }) => {
		if (!HandlerCache.getLocationPermissions)
			HandlerCache.getLocationPermissions = await import('./query.getLocationPermissions.handler').then(
				(mod) => mod.getLocationPermissions
			)
		if (!HandlerCache.getLocationPermissions) throw new Error('Failed to load handler')
		return HandlerCache.getLocationPermissions({ ctx })
	}),
	surveyOptions: publicProcedure.query(async () => {
		if (!HandlerCache.surveyOptions)
			HandlerCache.surveyOptions = await import('./query.surveyOptions.handler').then(
				(mod) => mod.surveyOptions
			)
		if (!HandlerCache.surveyOptions) throw new Error('Failed to load handler')
		return HandlerCache.surveyOptions()
	}),
	forgotPassword: publicProcedure.input(schema.ZForgotPasswordSchema).mutation(async ({ ctx, input }) => {
		if (!HandlerCache.forgotPassword)
			HandlerCache.forgotPassword = await import('./mutation.forgotPassword.handler').then(
				(mod) => mod.forgotPassword
			)
		if (!HandlerCache.forgotPassword) throw new Error('Failed to load handler')
		return HandlerCache.forgotPassword({ ctx, input })
	}),
	confirmAccount: publicProcedure.input(schema.ZConfirmAccountSchema).mutation(async ({ ctx, input }) => {
		if (!HandlerCache.confirmAccount)
			HandlerCache.confirmAccount = await import('./mutation.confirmAccount.handler').then(
				(mod) => mod.confirmAccount
			)
		if (!HandlerCache.confirmAccount) throw new Error('Failed to load handler')
		return HandlerCache.confirmAccount({ ctx, input })
	}),
	resetPassword: publicProcedure.input(schema.ZResetPasswordSchema).mutation(async ({ ctx, input }) => {
		if (!HandlerCache.resetPassword)
			HandlerCache.resetPassword = await import('./mutation.resetPassword.handler').then(
				(mod) => mod.resetPassword
			)
		if (!HandlerCache.resetPassword) throw new Error('Failed to load handler')
		return HandlerCache.resetPassword({ ctx, input })
	}),
	deleteAccount: protectedProcedure.input(schema.ZDeleteAccountSchema).mutation(async ({ input, ctx }) => {
		if (!HandlerCache.deleteAccount)
			HandlerCache.deleteAccount = await import('./mutation.deleteAccount.handler').then(
				(mod) => mod.deleteAccount
			)
		if (!HandlerCache.deleteAccount) throw new Error('Failed to load handler')
		return HandlerCache.deleteAccount({ ctx, input })
	}),
})
