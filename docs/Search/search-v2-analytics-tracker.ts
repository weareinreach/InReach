/**
 * DRAFT PROTOTYPE: Search V2 Analytics Tracker Maps UI interactions to the tracking infrastructure.
 */
// import { analytics } from '@weareinreach/analytics';

export const trackSearchV2Action = (event: string, metadata: Record<string, unknown>) => {
	const payload = {
		...metadata,
		timestamp: new Date().toISOString(),
		version: 'V2',
	}

	console.log(`[Analytics] ${event}:`, payload)
	// analytics.track(event, payload);
}
