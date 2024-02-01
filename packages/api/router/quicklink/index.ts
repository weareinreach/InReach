import { defineRouter, importHandler, permissionedProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'quicklink'

const namespaced = (s: string) => `${NAMESPACE}.${s}`
export const quickLinkRouter = defineRouter({
	getPhoneData: permissionedProcedure('updateLocation')
		.input(schema.ZGetPhoneDataSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('getPhoneData'),
				() => import('./query.getPhoneData.handler')
			)
			return handler(opts)
		}),
	updatePhoneData: permissionedProcedure('updateLocation')
		.input(schema.ZUpdatePhoneDataSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('updatePhoneData'),
				() => import('./mutation.updatePhoneData.handler')
			)
			return handler(opts)
		}),
	getEmailData: permissionedProcedure('updateLocation')
		.input(schema.ZGetEmailDataSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('getEmailData'),
				() => import('./query.getEmailData.handler')
			)
			return handler(opts)
		}),
	updateEmailData: permissionedProcedure('updateLocation')
		.input(schema.ZUpdateEmailDataSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('updateEmailData'),
				() => import('./mutation.updateEmailData.handler')
			)
			return handler(opts)
		}),
	getServiceLocationData: permissionedProcedure('updateLocation')
		.input(schema.ZGetServiceLocationDataSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('getServiceLocationData'),
				() => import('./query.getServiceLocationData.handler')
			)
			return handler(opts)
		}),
	updateServiceLocationData: permissionedProcedure('updateLocation')
		.input(schema.ZUpdateServiceLocationDataSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('updateServiceLocationData'),
				() => import('./mutation.updateServiceLocationData.handler')
			)
			return handler(opts)
		}),
})
