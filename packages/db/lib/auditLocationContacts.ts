/**
 * Read-only preview for the location-vs-organization contact cleanup. Changes nothing - it reports, for each
 * contact type, which location-linked phones/emails/websites/social accounts the cleanup migration would mark
 * "location only", which it would leave alone, and which need a person to decide. Detection lives in
 * locationContactCleanup.ts, shared with the migration itself.
 *
 * Run with: pnpm --filter @weareinreach/db db:audit-location-contacts Optional: EXAMPLES=n (examples per
 * group, default 5), CSV=/path/to/file.csv (every classified item).
 */
/* eslint-disable node/no-process-env */
import { writeFileSync } from 'node:fs'

import { prisma } from '~db/client'
import {
	type Classification,
	type ClassifiedItem,
	classifyLocationContacts,
	type ContactType,
	loadLocationLinkedContacts,
	type OrgContext,
	planCleanup,
} from '~db/lib/locationContactCleanup'

const TYPES: ContactType[] = ['phone', 'email', 'website', 'socialMedia']
const TYPE_LABEL: Record<ContactType, string> = {
	phone: 'Phones',
	email: 'Emails',
	website: 'Websites',
	socialMedia: 'Social media',
}
const CLASS_LABEL: Record<Classification, string> = {
	duplicateOfOrgItem: 'Would mark location-only: duplicates an org-level item',
	emailAddedFromLocation: 'Would mark location-only: email added from a location (no org link)',
	alreadyLocationOnly: 'Leave alone: already location-only',
	singleLocationOrg: 'Leave alone: single-location org (its page shows everything either way)',
	locationOnlyWithoutLocation:
		'Needs a person: marked location-only but linked to no location (mark cleared until reviewed)',
	needsReview: 'Needs a person (review list; phones also marked location-only until reviewed)',
}
const ORDER: Classification[] = [
	'duplicateOfOrgItem',
	'emailAddedFromLocation',
	'alreadyLocationOnly',
	'singleLocationOrg',
	'locationOnlyWithoutLocation',
	'needsReview',
]

const describe = (item: ClassifiedItem, orgs: Map<string, OrgContext>, byId: Map<string, ClassifiedItem>) => {
	const org = orgs.get(item.orgId)
	const locNames = item.locationIds
		.map((id) => org?.locations.find((loc) => loc.id === id))
		.map((loc) => (loc ? (loc.name ?? loc.city) : '?'))
	const where = `linked to ${item.locationIds.length} of ${org?.locations.length ?? '?'} locations (${locNames.join(', ')})`
	const match = item.matchesOrgItemId
		? `  | org-level copy: ${byId.get(item.matchesOrgItemId)?.display ?? item.matchesOrgItemId}`
		: ''
	return `    ${item.display}  -  ${org?.name ?? item.orgId} (/${org?.slug ?? '?'})  -  ${where}${match}`
}

const run = async () => {
	const examples = Number(process.env.EXAMPLES ?? 5)
	const { items, orgs } = await loadLocationLinkedContacts(prisma)
	const classified = classifyLocationContacts(items, orgs)
	const plan = planCleanup(classified)
	const markedIds = new Set(plan.mark.map(({ item }) => item.id))
	const allById = new Map(items.map((item) => [item.id, item as ClassifiedItem]))

	const multi = (item: ClassifiedItem) => (orgs.get(item.orgId)?.locations.length ?? 0) > 1
	console.log('Location contact cleanup - preview (read-only, nothing is changed)\n')
	console.log(
		'Counts are location-linked items on published orgs. "multi" = org has 2+ published locations ' +
			'(where the org page and location pages differ); "single" = 1 location.\n'
	)

	for (const type of TYPES) {
		const ofType = classified.filter((item) => item.type === type)
		const markCount = ofType.filter((item) => markedIds.has(item.id)).length
		console.log(
			`== ${TYPE_LABEL[type]}: ${ofType.length} location-linked, ${markCount} would be marked location-only`
		)
		for (const classification of ORDER) {
			const group = ofType.filter((item) => item.classification === classification)
			if (!group.length) {
				continue
			}
			const multiCount = group.filter(multi).length
			console.log(
				`  ${CLASS_LABEL[classification]}: ${group.length} (multi ${multiCount}, single ${group.length - multiCount})`
			)
			for (const item of group.filter(multi).slice(0, examples)) {
				console.log(describe(item, orgs, allById))
			}
		}
		console.log('')
	}

	const reviewOrgs = new Set(plan.needsReview.map(({ orgId }) => orgId))
	console.log('What the migration would write:')
	console.log(`  Mark location-only (each with a note saying why): ${plan.mark.length}`)
	console.log(`  Clear the location-only mark (each with a note saying why): ${plan.unmark.length}`)
	console.log(`  "Needs review" notes: ${plan.needsReview.length}, across ${reviewOrgs.size} organizations`)

	if (process.env.CSV) {
		const header = 'type,classification,value,org,orgSlug,orgLocations,linkedLocations,orgLevelCopy,id'
		const rows = classified.map((item) => {
			const org = orgs.get(item.orgId)
			return [
				item.type,
				item.classification,
				item.display,
				org?.name ?? '',
				org?.slug ?? '',
				org?.locations.length ?? '',
				item.locationIds.length,
				item.matchesOrgItemId ? (allById.get(item.matchesOrgItemId)?.display ?? '') : '',
				item.id,
			]
				.map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
				.join(',')
		})
		writeFileSync(process.env.CSV, [header, ...rows].join('\n'))
		console.log(`\nWrote ${rows.length} rows to ${process.env.CSV}`)
	}
}

run()
	.catch((error) => {
		console.error(error)
		process.exitCode = 1
	})
	.finally(() => prisma.$disconnect())
