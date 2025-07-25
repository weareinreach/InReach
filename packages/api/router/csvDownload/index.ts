import { defineRouter, importHandler, permissionedProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'csvDownload'

const namespaced = (s: string) => `${NAMESPACE}.${s}`
export const csvDownloadRouter = defineRouter({
	getAllPublishedForCSV: permissionedProcedure('dataPortalManager')
		.input(schema.ZGetAllPublishedForCSVSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('getAllPublishedForCSV'),
				() => import('./query.getAllPublishedForCSV.handler')
			)
			return handler(opts)
		}),
	getAllUnpublishedForCSV: permissionedProcedure('dataPortalManager')
		.input(schema.ZGetAllUnpublishedForCSVSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('getAllUnpublishedForCSV'),
				() => import('./query.getAllUnpublishedForCSV.handler')
			)
			return handler(opts)
		}),
	getOrgsWithReviews: permissionedProcedure('dataPortalManager')
		.input(schema.ZGetAllUnpublishedForCSVSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('getOrgsWithReviews'),
				() => import('./query.getOrgsWithReviews.handler')
			)
			return handler(opts)
		}),
	getOrgCountByCountry: permissionedProcedure('dataPortalManager')
		.input(schema.ZGetOrgCountByCountrySchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('getOrgCountByCountry'),
				() => import('./query.getOrgCountByCountry.handler')
			)
			return handler(opts)
		}),
	getOrgCountByCountryAttribute: permissionedProcedure('dataPortalManager')
		.input(schema.ZGetOrgCountByCountryAttributeSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('getOrgCountByCountryAttribute'),
				() => import('./query.getOrgCountByCountryAttribute.handler')
			)
			return handler(opts)
		}),
	getOrgCountByState: permissionedProcedure('dataPortalManager')
		.input(schema.ZGetOrgCountByCountryAttributeSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('getOrgCountByState'),
				() => import('./query.getOrgCountByState.handler')
			)
			return handler(opts)
		}),
	getPublishedOrgServicesCalifornia: permissionedProcedure('dataPortalManager')
		.input(schema.ZGetOrgCountByCountryAttributeSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('getPublishedOrgServicesCalifornia'),
				() => import('./query.getPublishedOrgServicesCalifornia.handler')
			)
			return handler(opts)
		}),
	getServiceCountByCountry: permissionedProcedure('dataPortalManager')
		.input(schema.ZGetOrgCountByCountryAttributeSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('getServiceCountByCountry'),
				() => import('./query.getServiceCountByCountry.handler')
			)
			return handler(opts)
		}),
	getServicesCountByCategoryCalifornia: permissionedProcedure('dataPortalManager')
		.input(schema.ZGetOrgCountByCountryAttributeSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('getServicesCountByCategoryCalifornia'),
				() => import('./query.getServicesCountByCategoryCalifornia.handler')
			)
			return handler(opts)
		}),
	getServicesCountByCategoryCountry: permissionedProcedure('dataPortalManager')
		.input(schema.ZGetOrgCountByCountryAttributeSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('getServicesCountByCategoryCountry'),
				() => import('./query.getServicesCountByCategoryCountry.handler')
			)
			return handler(opts)
		}),
	getServicesCountByCountryAttribute: permissionedProcedure('dataPortalManager')
		.input(schema.ZGetOrgCountByCountryAttributeSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('getServicesCountByCountryAttribute'),
				() => import('./query.getServicesCountByCountryAttribute.handler')
			)
			return handler(opts)
		}),
	getServicesCountByCountryState: permissionedProcedure('dataPortalManager')
		.input(schema.ZGetOrgCountByCountryAttributeSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('getServicesCountByCountryState'),
				() => import('./query.getServicesCountByCountryState.handler')
			)
			return handler(opts)
		}),
})
