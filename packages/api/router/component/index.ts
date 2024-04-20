import { defineRouter, importHandler, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'component'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

export const componentRouter = defineRouter({
	serviceModal: publicProcedure.input(schema.ZServiceModalSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('serviceModal'),
			() => import('./query.serviceModal.handler')
		)
		return handler(opts)
	}),
	ServiceSelect: permissionedProcedure('updateOrgService').query(async (opts) => {
		const handler = await importHandler(
			namespaced('ServiceSelect'),
			() => import('./query.ServiceSelect.handler')
		)
		return handler(opts)
	}),
	EditModeBar: permissionedProcedure('createNewOrgQuick')
		.input(schema.ZEditModeBarSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('EditModeBar'),
				() => import('./query.EditModeBar.handler')
			)
			return handler(opts)
		}),
	EditModeBarReverify: permissionedProcedure('createNewOrgQuick')
		.input(schema.ZEditModeBarReverifySchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('reverify'),
				() => import('./mutation.EditModeBarReverify.handler')
			)
			return handler(opts)
		}),
	EditModeBarDelete: permissionedProcedure('createNewOrgQuick')
		.input(schema.ZEditModeBarDeleteSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('EditModeBarDelete'),
				() => import('./mutation.EditModeBarDelete.handler')
			)
			return handler(opts)
		}),
	EditModeBarPublish: permissionedProcedure('createNewOrgQuick')
		.input(schema.ZEditModeBarPublishSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('EditModeBarPublish'),
				() => import('./mutation.EditModeBarPublish.handler')
			)
			return handler(opts)
		}),
	AttributeEditWrapper: permissionedProcedure('updateOrgService')
		.input(schema.ZAttributeEditWrapperSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('AttributeEditWrapper'),
				() => import('./mutation.AttributeEditWrapper.handler')
			)
			return handler(opts)
		}),
})
