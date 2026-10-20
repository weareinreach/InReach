import { isIdFor } from '@weareinreach/db/lib/idGen'

/**
 * Where a just-saved contact item belongs when a drawer patches an edit list's cache directly (same rule as
 * each type's forContactInfoEdit): an organization's edit list holds only the organization's own items, never
 * location-only ones; a location's edit list holds everything linked to it, flagging the organization's items
 * (`linkedFromOrg`) since those are changed on the organization's page.
 */
export const contactEditListPlacement = (parentId: string, locationOnly: boolean) => {
	const isLocationList = isIdFor('orgLocation', parentId)
	return { include: isLocationList || !locationOnly, linkedFromOrg: isLocationList && !locationOnly }
}
