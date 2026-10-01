import { defineRouter, importHandler, permissionedProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'dashboard'

const namespaced = (s: string) => `${NAMESPACE}.${s}`
export const dashboardRouter = defineRouter({
	unpublishedStatusSummary: permissionedProcedure('dataPortalManager')
		.input(schema.ZUnpublishedStatusSummarySchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('unpublishedStatusSummary'),
				() => import('./query.unpublishedStatusSummary.handler')
			)
			return handler(opts)
		}),
	unpublishedStatusWorklist: permissionedProcedure('dataPortalManager')
		.input(schema.ZUnpublishedStatusWorklistSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('unpublishedStatusWorklist'),
				() => import('./query.unpublishedStatusWorklist.handler')
			)
			return handler(opts)
		}),
	// #region KPI Board - see docs/Dashboards/KpiBoard/README.md
	kpiBoardRegionMappingList: permissionedProcedure('dataPortalManager')
		.input(schema.ZKpiBoardRegionMappingListSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('kpiBoardRegionMappingList'),
				() => import('./query.kpiBoardRegionMappingList.handler')
			)
			return handler(opts)
		}),
	kpiBoardRegionMappingCreate: permissionedProcedure('kpiBoardRegionMappingWrite')
		.input(schema.ZKpiBoardRegionMappingCreateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('kpiBoardRegionMappingCreate'),
				() => import('./mutation.kpiBoardRegionMappingCreate.handler')
			)
			return handler(opts)
		}),
	kpiBoardRegionMappingUpdate: permissionedProcedure('kpiBoardRegionMappingWrite')
		.input(schema.ZKpiBoardRegionMappingUpdateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('kpiBoardRegionMappingUpdate'),
				() => import('./mutation.kpiBoardRegionMappingUpdate.handler')
			)
			return handler(opts)
		}),
	kpiBoardRegionMappingDelete: permissionedProcedure('kpiBoardRegionMappingWrite')
		.input(schema.ZKpiBoardRegionMappingDeleteSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('kpiBoardRegionMappingDelete'),
				() => import('./mutation.kpiBoardRegionMappingDelete.handler')
			)
			return handler(opts)
		}),
	kpiBoardManualMetricUpsert: permissionedProcedure('dataPortalManager')
		.input(schema.ZKpiBoardManualMetricUpsertSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('kpiBoardManualMetricUpsert'),
				() => import('./mutation.kpiBoardManualMetricUpsert.handler')
			)
			return handler(opts)
		}),
	kpiBoardManualMetricList: permissionedProcedure('dataPortalManager')
		.input(schema.ZKpiBoardManualMetricListSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('kpiBoardManualMetricList'),
				() => import('./query.kpiBoardManualMetricList.handler')
			)
			return handler(opts)
		}),
	kpiBoardMapMarkers: permissionedProcedure('dataPortalManager')
		.input(schema.ZKpiBoardMapMarkersSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('kpiBoardMapMarkers'),
				() => import('./query.kpiBoardMapMarkers.handler')
			)
			return handler(opts)
		}),
	// #endregion
})
