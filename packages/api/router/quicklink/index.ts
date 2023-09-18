import { defineRouter, permissionedProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const HandlerCache: Partial<QuicklinkHandlerCache> = {}

type QuicklinkHandlerCache = {
	getEmailData: typeof import('./query.getEmailData.handler').getEmailData
	updateEmailData: typeof import('./mutation.updateEmailData.handler').updateEmailData
	getPhoneData: typeof import('./query.getPhoneData.handler').getPhoneData
	updatePhoneData: typeof import('./mutation.updatePhoneData.handler').updatePhoneData
	getServiceLocationData: typeof import('./query.getServiceLocationData.handler').getServiceLocationData
	updateServiceLocationData: typeof import('./mutation.updateServiceLocationData.handler').updateServiceLocationData
}

export const quickLinkRouter = defineRouter({
	getPhoneData: permissionedProcedure('updateLocation')
		.input(schema.ZGetPhoneDataSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.getPhoneData)
				HandlerCache.getPhoneData = await import('./query.getPhoneData.handler').then(
					(mod) => mod.getPhoneData
				)
			if (!HandlerCache.getPhoneData) throw new Error('Failed to load handler')
			return HandlerCache.getPhoneData({ ctx, input })
		}),
	updatePhoneData: permissionedProcedure('updateLocation')
		.input(schema.ZUpdatePhoneDataSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.updatePhoneData)
				HandlerCache.updatePhoneData = await import('./mutation.updatePhoneData.handler').then(
					(mod) => mod.updatePhoneData
				)
			if (!HandlerCache.updatePhoneData) throw new Error('Failed to load handler')
			return HandlerCache.updatePhoneData({ ctx, input })
		}),
	getEmailData: permissionedProcedure('updateLocation')
		.input(schema.ZGetEmailDataSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.getEmailData)
				HandlerCache.getEmailData = await import('./query.getEmailData.handler').then(
					(mod) => mod.getEmailData
				)
			if (!HandlerCache.getEmailData) throw new Error('Failed to load handler')
			return HandlerCache.getEmailData({ ctx, input })
		}),
	updateEmailData: permissionedProcedure('updateLocation')
		.input(schema.ZUpdateEmailDataSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.updateEmailData)
				HandlerCache.updateEmailData = await import('./mutation.updateEmailData.handler').then(
					(mod) => mod.updateEmailData
				)
			if (!HandlerCache.updateEmailData) throw new Error('Failed to load handler')
			return HandlerCache.updateEmailData({ ctx, input })
		}),
	getServiceLocationData: permissionedProcedure('updateLocation')
		.input(schema.ZGetServiceLocationDataSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.getServiceLocationData)
				HandlerCache.getServiceLocationData = await import('./query.getServiceLocationData.handler').then(
					(mod) => mod.getServiceLocationData
				)
			if (!HandlerCache.getServiceLocationData) throw new Error('Failed to load handler')
			return HandlerCache.getServiceLocationData({ ctx, input })
		}),
	updateServiceLocationData: permissionedProcedure('updateLocation')
		.input(schema.ZUpdateServiceLocationDataSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.updateServiceLocationData)
				HandlerCache.updateServiceLocationData = await import(
					'./mutation.updateServiceLocationData.handler'
				).then((mod) => mod.updateServiceLocationData)
			if (!HandlerCache.updateServiceLocationData) throw new Error('Failed to load handler')
			return HandlerCache.updateServiceLocationData({ ctx, input })
		}),
})
