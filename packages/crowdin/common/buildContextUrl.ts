/* eslint-disable node/no-process-env */
const APP_BASE_URL = process.env.APP_BASE_URL ?? 'https://app.inreach.org'

/**
 * Builds the Crowdin `context` URL for a translation key: the location page (org/<slug>/<oloc_id>) when a
 * location ID is given, otherwise the plain org page (org/<slug>) - covers org-level and service-level keys
 * alike, since services don't have their own page/anchor in the app.
 *
 * Keep this in sync with the identical logic in packages/db/lib/syncCrowdinContext.ts (which can't import
 * from here directly at the DB layer, but should build the same URL for the same inputs).
 */
export const buildContextUrl = (slug: string, locationId?: string) =>
	locationId ? `${APP_BASE_URL}/org/${slug}/${locationId}` : `${APP_BASE_URL}/org/${slug}`
