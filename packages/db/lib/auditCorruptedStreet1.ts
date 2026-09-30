/**
 * Read-only audit for GH issue #2093 (address autocomplete duplicated city/state/country into street1). This
 * does not modify anything - it just reports which `OrgLocation` rows currently look corrupted and what
 * they'd become if cleaned (see detectCorruptedStreet1.ts for the detection/fix logic, shared with the actual
 * cleanup migration).
 *
 * Run with: pnpm --filter @weareinreach/db db:audit-street1
 */
import { prisma } from '~db/client'
import { findCleanedStreet1 } from '~db/lib/detectCorruptedStreet1'

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
			const cleaned = findCleanedStreet1(loc.street1, loc.city)
			return cleaned ? { ...loc, cleaned } : null
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
