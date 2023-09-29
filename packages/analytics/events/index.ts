import compact from 'just-compact'
import { type NextWebVitalsMetric } from 'next/app'
import { event } from 'nextjs-google-analytics'

// eslint-disable-next-line import/consistent-type-specifier-style
import type { ServiceCategoryToggleAction } from './types'

export const serviceFilterEvent = {
	select: (serviceId: string, service?: string, category?: string) =>
		event('service_filter_select', { serviceId, service, category }),
	unselect: (serviceId: string, service?: string, category?: string) =>
		event('service_filter_unselect', { serviceId, service, category }),
	toggleCategory: (category: string, action: ServiceCategoryToggleAction) =>
		event('service_filter_category_toggle', { category, action }),
	deselectAll: (selectedServices: (string | undefined)[]) =>
		event('service_filter_deselect_all', { selectedServices: compact(selectedServices) }),
}

export const navbarEvent = {
	safetyExit: () => event('safety_exit'),
}

export const searchBoxEvent = {
	searchLocation: (term: string, placeId: string) =>
		event('search', { search_term: term, google_place_id: placeId }),
	searchOrg: (term: string, selectedOrg: string) =>
		event('orgSearch', { search_term: term, selected_org: selectedOrg }),
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
