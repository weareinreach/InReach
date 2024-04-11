import {
	adminProcedure,
	defineRouter,
	importHandler,
	permissionedProcedure,
	protectedProcedure,
	publicProcedure,
} from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'user'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

export const userRouter = defineRouter({
	create: publicProcedure.input(schema.ZCreateSchema).mutation(async (opts) => {
		const handler = await importHandler(namespaced('create'), () => import('./mutation.create.handler'))
		return handler(opts)
	}),
	adminCreate: adminProcedure.input(schema.ZAdminCreateSchema).mutation(async (opts) => {
		const handler = await importHandler(
			namespaced('adminCreate'),
			() => import('./mutation.adminCreate.handler')
		)
		return handler(opts)
	}),
	submitSurvey: publicProcedure.input(schema.ZSubmitSurveySchema).mutation(async (opts) => {
		const handler = await importHandler(
			namespaced('submitSurvey'),
			() => import('./mutation.submitSurvey.handler')
		)
		return handler(opts)
	}),
	getProfile: protectedProcedure.query(async (opts) => {
		const handler = await importHandler(namespaced('getProfile'), () => import('./query.getProfile.handler'))
		return handler(opts)
	}),
	getPermissions: protectedProcedure.query(async (opts) => {
		const handler = await importHandler(
			namespaced('getPermissions'),
			() => import('./query.getPermissions.handler')
		)
		return handler(opts)
	}),
	getOrgPermissions: protectedProcedure.query(async (opts) => {
		const handler = await importHandler(
			namespaced('getOrgPermissions'),
			() => import('./query.getOrgPermissions.handler')
		)
		return handler(opts)
	}),
	getLocationPermissions: protectedProcedure.query(async (opts) => {
		const handler = await importHandler(
			namespaced('getLocationPermissions'),
			() => import('./query.getLocationPermissions.handler')
		)
		return handler(opts)
	}),
	surveyOptions: publicProcedure.query(async () => {
		const handler = await importHandler(
			namespaced('surveyOptions'),
			() => import('./query.surveyOptions.handler')
		)
		return handler()
	}),
	forgotPassword: publicProcedure.input(schema.ZForgotPasswordSchema).mutation(async (opts) => {
		const handler = await importHandler(
			namespaced('forgotPassword'),
			() => import('./mutation.forgotPassword.handler')
		)
		return handler(opts)
	}),
	confirmAccount: publicProcedure.input(schema.ZConfirmAccountSchema).mutation(async (opts) => {
		const handler = await importHandler(
			namespaced('confirmAccount'),
			() => import('./mutation.confirmAccount.handler')
		)
		return handler(opts)
	}),
	resetPassword: publicProcedure.input(schema.ZResetPasswordSchema).mutation(async (opts) => {
		const handler = await importHandler(
			namespaced('resetPassword'),
			() => import('./mutation.resetPassword.handler')
		)
		return handler(opts)
	}),
	deleteAccount: protectedProcedure.input(schema.ZDeleteAccountSchema).mutation(async ({ input, ctx }) => {
		const handler = await importHandler(
			namespaced('deleteAccount'),
			() => import('./mutation.deleteAccount.handler')
		)
		return handler({ input, ctx })
	}),
	forUserTable: permissionedProcedure('viewAllUsers')
		.input(schema.ZForUserTableSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('forUserTable'),
				() => import('./query.forUserTable.handler')
			)
			return handler(opts)
		}),
})
