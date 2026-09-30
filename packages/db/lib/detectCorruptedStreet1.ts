/**
 * Shared detection/fix logic for GH #2093 (address autocomplete duplicated city/state/country into street1,
 * fixed in packages/ui/components/data-portal/{AddressDrawer,AddressAutocomplete}/index.tsx). That fix stops
 * new corruption from being written going forward - it does nothing for `street1` values that were already
 * saved corrupted before the fix existed. Used by both the read-only audit (auditCorruptedStreet1.ts, `pnpm
 * --filter @weareinreach/db db:audit-street1`) and the data-migration that actually cleans up
 * already-affected rows (prisma/data-migrations/2026-09-25_cleanup-duplicated-street1.ts).
 *
 * The city appearing as its own comma-delimited segment (e.g. `street1 = "1 Bethany Road, Hazlet, NJ, USA"`
 * for a location whose `city` is "Hazlet") is the specific, distinctive fingerprint the bug left behind. A
 * plain substring check (does `street1` contain the city name anywhere) is too loose - it also matches
 * completely legitimate streets that happen to be named after their city (e.g. "1091 West South Jordan
 * Parkway" in South Jordan), which are common and not this bug.
 */
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Returns the cleaned `street1` (everything before the city's own comma-delimited segment) if `street1` looks
 * corrupted, or `null` if it doesn't (nothing to clean, or cleaning it would be a no-op).
 */
export const findCleanedStreet1 = (street1: string | null, city: string | null): string | null => {
	if (!street1 || !city) {
		return null
	}
	const cityAsOwnSegment = new RegExp(`,\\s*${escapeRegex(city)}\\s*(,|$)`, 'i')
	if (!cityAsOwnSegment.test(street1)) {
		return null
	}
	const cleaned = street1.split(cityAsOwnSegment)[0]?.trim()
	if (!cleaned || cleaned === street1) {
		return null
	}
	return cleaned
}
