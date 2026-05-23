/**
 * Tracks search behavior to identify top areas of demand. Events are only fired if the user has accepted GA4
 * consent.
 */
export const trackSearchPerformance = (params: {
	location?: string
	categoryId?: string
	query?: string
}) => {
	if (typeof window !== 'undefined' && window.gtag) {
		window.gtag('event', 'search_executed', {
			// Capture the location (ZIP or City)
			search_location: params.location || 'remote',
			// Capture the category they are filtering by
			service_category: params.categoryId || 'all',
			// Capture the raw text query if applicable
			search_term: params.query || '',
		})
	}
}
