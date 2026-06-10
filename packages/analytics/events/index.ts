import compact from 'just-compact'
import { type NextWebVitalsMetric } from 'next/app'

import { event } from '../lib/event'

// eslint-disable-next-line import/consistent-type-specifier-style
import type { ServiceCategoryToggleAction, ServiceModalOpenedAction } from './types'

export const serviceFilterEvent = {
	select: (serviceId: string, service?: string, category?: string) =>
		event('filter_select', { serviceId, service_name: service, service_category: category }),
	unselect: (serviceId: string, service?: string, category?: string) =>
		event('service_filter_unselect', { serviceId, service_name: service, service_category: category }),
	toggleCategory: (category: string, action: ServiceCategoryToggleAction) =>
		event('service_filter_category_toggle', { service_category: category, action }),
	deselectAll: (selectedServices: (string | undefined)[]) =>
		event('service_filter_deselect_all', { service_name: compact(selectedServices) }),
}

export const navbarEvent = {
	safetyExit: () => event('safety_exit'),
}

export const consentEvent = {
	update: (status: 'granted' | 'denied', service: string) => event('consent_update', { status, service }),
}

export const searchBoxEvent = {
	searchLocation: (term: string, placeId: string) =>
		event('search', { search_term: term, google_place_id: placeId }),
	searchOrg: (term: string, selectedOrg: string) =>
		event('orgSearch', { search_term: term, selected_org: selectedOrg }),
	zeroResults: (
		term: string,
		type: 'location' | 'organization',
		serviceCategory?: string,
		params?: string[]
	) =>
		event('search_zero_results', {
			search_term: term,
			search_type: type,
			service_category: serviceCategory,
			location_params: params,
		}),
	suggestResource: (term: string) => event('suggest_resource_click', { search_term: term }),
	suggestResourceSubmit: (orgName: string) => event('suggest_resource_submit', { item_name: orgName }),
}

export const appEvent = {
	webVitals: ({ id, name, label, value }: NextWebVitalsMetric) =>
		event(name, {
			category: label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
			value: Math.round(name === 'CLS' ? value * 1000 : value), // values must be integers
			label: id, // id unique to current page load
			nonInteraction: true, // avoids affecting bounce rate.
		}),
}

export const serviceModalEvent = {
	opened: ({ serviceId, serviceName, orgSlug }: ServiceModalOpenedAction) =>
		event('select_content', { content_type: 'orgService', content_id: serviceId, serviceName, orgSlug }),
}

export const donateEvent = {
	click: () => event('select_content', { content_type: 'donation_button' }),
}
export const userEvent = {
	signup: (userType?: string) => event('sign_up', { userType }),
	login: () => event('login'),
}

export const reportEvent = {
	open: (target: 'service' | 'organization', itemId: string) =>
		event('report_open', { report_target: target, item_id: itemId }),
	submitSuccess: (
		target: 'service' | 'organization',
		itemId: string,
		issueType?: string,
		language?: string
	) =>
		event('report_submit_success', {
			report_target: target,
			item_id: itemId,
			issue_type: issueType,
			language,
		}),
}

export const productEvent = {
	/**
	 * Profile_view: Tracks when a user selects a result from the search list. Includes 'search_term_context' to
	 * link anonymous searches to clicks.
	 */
	profileView: (
		itemId: string,
		itemName: string,
		metadata: {
			searchTermContext?: string
			position?: number
			searchVersion?: 'V1' | 'V2'
			distanceMeters?: number
		}
	) =>
		event('profile_view', {
			item_id: itemId,
			item_name: itemName,
			search_term_context: metadata.searchTermContext,
			position: metadata.position, // Tracking the rank in the search list
			search_version: metadata.searchVersion,
			distance_meters: metadata.distanceMeters,
		}),

	/**
	 * Item_save: Tracks when a user saves a resource to their personal list.
	 */
	itemSave: (itemId: string, itemName: string, action: 'save' | 'unsave') =>
		event('item_save', {
			item_id: itemId,
			item_name: itemName,
			action,
		}),

	/**
	 * Outbound_click: Tracks when a user clicks a link to an external provider resource.
	 */
	outboundClick: (
		type: 'website' | 'email' | 'phone' | 'directions' | 'social',
		url: string,
		itemName: string
	) =>
		event('outbound_click', {
			link_type: type,
			link_url: url,
			item_name: itemName,
		}),
}

export const searchV2Event = {
	/**
	 * Tracks engagement with the advanced settings modal.
	 */
	opened: (source: string) => event('advanced_search_opened', { source }),
	closed: (applied: boolean) => event('advanced_search_closed', { applied }),

	/**
	 * Tracks when the V2 algorithm is executed.
	 */
	applied: (metadata: {
		source: string
		match_mode?: string
		sort_bias?: string
		include_national?: boolean
		priority_count?: number
	}) => event('search_v2_applied', metadata),

	/**
	 * Performance and Quality metrics.
	 */
	summary: (resultCount: number, latencyMs: number) =>
		event('search_v2_results_summary', { result_count: resultCount, search_latency_ms: latencyMs }),

	zeroResults: (matchMode: string, radius: number, filterCount: number) =>
		event('zero_results_reached', { match_mode: matchMode, radius, active_filter_count: filterCount }),
}
