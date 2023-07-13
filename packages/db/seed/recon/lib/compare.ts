import { trimSpaces } from '~db/seed/recon/lib/utils'

export const needsUpdate = (existing: unknown, migrated: unknown) => {
	if (
		existing === null &&
		(migrated === undefined || migrated === null || (typeof migrated === 'string' && migrated.trim() === ''))
	) {
		return false
	}
	if (typeof existing === 'string' && typeof migrated === 'string') {
		return trimSpaces(existing) !== trimSpaces(migrated)
	}
	if (typeof existing === typeof migrated) {
		return existing !== migrated
	}
}
