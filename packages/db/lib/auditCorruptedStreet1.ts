/**
 * Read-only audit for GH issue #2093 (address autocomplete duplicated city/state/country into street1, fixed
 * in packages/ui/components/data-portal/{AddressDrawer,AddressAutocomplete}/index.tsx). The fix stops new
 * corruption from being written going forward - it does nothing for `street1` values that were already saved
 * corrupted before the fix existed.
 *
 * This does not modify anything. It just reports which `OrgLocation` rows currently have a `street1` where
 * the location's own `city` appears as its own comma-delimited segment - the specific, distinctive
 * fingerprint the bug left behind (e.g. `street1 = "1 Bethany Road, Hazlet, NJ, USA"` for a location whose
 * `city` is "Hazlet"). A plain substring check (does `street1` contain the city name anywhere) is too loose -
 * it also matches completely legitimate streets that happen to be named after their city (e.g. "1091 West
 * South Jordan Parkway" in South Jordan), which are common and not this bug. Requiring the city to be its own
 * `, City,`/`, City$` segment - the shape Google's "main_text, secondary_text" duplication actually produces
 *
 * - Avoids that class of false positive.
 *
 * Run with: pnpm --filter @weareinreach/db db:audit-street1
 */
import { prisma } from '~db/client'

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const run = async () => {
	const candidates = await prisma.orgLocation.findMany({
		where: {
			street1: { not: null },
			city: { not: '' },
		},
		select: {
			id: true,
			name: true,
			street1: true,
			street2: true,
			city: true,
			postCode: true,
			organization: { select: { name: true, slug: true } },
		},
	})

	const affected = candidates
		.map((loc) => {
			if (!loc.street1 || !loc.city) {
				return null
			}
			const cityAsOwnSegment = new RegExp(`,\\s*${escapeRegex(loc.city)}\\s*(,|$)`, 'i')
			if (!cityAsOwnSegment.test(loc.street1)) {
				return null
			}
			// Same fix as the UI: everything from the city's own comma-delimited segment onward is
			// the duplicated "city, state, country" tail - the true street is just what's before it.
			const cleaned = loc.street1.split(cityAsOwnSegment)[0]?.trim()
			return { ...loc, cleaned }
		})
		.filter((loc): loc is NonNullable<typeof loc> => loc !== null)

	if (!affected.length) {
		console.log(`Checked ${candidates.length} locations with a street1 - none look corrupted.`)
		return
	}

	console.log(
		`Checked ${candidates.length} locations with a street1 - ${affected.length} look corrupted ` +
			`(street1 contains their own city name as its own comma-delimited segment):\n`
	)
	for (const loc of affected) {
		console.log(
			[
				`- ${loc.organization.name} (/${loc.organization.slug}) - location "${loc.name ?? loc.id}" (${loc.id})`,
				`  street1 (current): ${JSON.stringify(loc.street1)}`,
				`  street1 (cleaned): ${JSON.stringify(loc.cleaned)}`,
				`  city:              ${JSON.stringify(loc.city)}`,
			].join('\n')
		)
	}
	console.log(`\n${affected.length} location(s) flagged. This script made no changes - it only reports.`)
}

run()
	.catch((error) => {
		console.error(error)
		process.exitCode = 1
	})
	.finally(() => prisma.$disconnect())
