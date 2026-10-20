import { prisma } from '@weareinreach/db'
import { CLEANUP_NOTE, type ContactType } from '@weareinreach/db/lib/locationContactCleanup'

const isPublic = { published: true, deleted: false }

/**
 * Still waiting for a decision: carries the cleanup migration's "Needs review" note
 * (2026-10-19_location-contact-cleanup) and no "Reviewed" note yet.
 */
const awaitingReview = {
	...isPublic,
	internalNotes: {
		some: { text: CLEANUP_NOTE.needsReview },
		none: { text: { startsWith: CLEANUP_NOTE.reviewedPrefix } },
	},
}

const orgSelect = {
	select: { id: true, name: true, slug: true, _count: { select: { locations: { where: isPublic } } } },
} as const

const linkedLocations = {
	where: { location: isPublic },
	select: { location: { select: { id: true, name: true, city: true, organization: orgSelect } } },
} as const

type OrgInfo = { id: string; name: string; slug: string; _count: { locations: number } }
type LinkedLocation = { location: { id: string; name: string | null; city: string; organization: OrgInfo } }

export interface LocationContactReviewRow {
	type: ContactType
	id: string
	/** The number, address, URL or `Platform @username`. */
	value: string
	/** Today's setting: false means it's marked location-only. */
	showOnOrgPage: boolean
	org: {
		id: string
		name: string
		slug: string
		locationCount: number
		/**
		 * Whether the organization's main page shows any phone number today. False is the case staff most need to
		 * look at: every number is at a location, so the main page has none.
		 */
		mainPageHasPhone: boolean
	}
	/** Empty for an item marked location-only but linked to no location (see `services`). */
	locations: { id: string; name: string }[]
	/** How many services it's linked to - where an item with no location still shows. */
	services: number
}

const toRow = ({
	type,
	id,
	value,
	locationOnly,
	links,
	ownOrg,
	services = 0,
}: {
	type: ContactType
	id: string
	value: string
	locationOnly: boolean
	links: LinkedLocation[]
	/** The organization it's stored under - used when it isn't linked to any location. */
	ownOrg: OrgInfo | null | undefined
	services?: number
}): LocationContactReviewRow | null => {
	const org = links[0]?.location.organization ?? ownOrg
	if (!org) {
		return null
	}
	return {
		type,
		id,
		value,
		showOnOrgPage: !locationOnly,
		org: {
			id: org.id,
			name: org.name,
			slug: org.slug,
			locationCount: org._count.locations,
			mainPageHasPhone: false,
		},
		locations: links
			.filter(({ location }) => location.organization.id === org.id)
			.map(({ location }) => ({ id: location.id, name: (location.name ?? location.city).trim() })),
		services,
	}
}

/**
 * The data managers' review list: every contact item the cleanup migration couldn't decide on by itself, one
 * row per item, until someone decides it (locationContactReview.decide).
 */
const list = async () => {
	const [phones, emails, websites, socials] = await Promise.all([
		prisma.orgPhone.findMany({
			where: awaitingReview,
			select: {
				id: true,
				number: true,
				locationOnly: true,
				locations: linkedLocations,
				organization: { select: { organization: orgSelect } },
				_count: { select: { services: { where: { service: isPublic } } } },
			},
		}),
		prisma.orgEmail.findMany({
			where: awaitingReview,
			select: {
				id: true,
				email: true,
				locationOnly: true,
				locations: linkedLocations,
				organization: { select: { organization: orgSelect }, take: 1 },
				_count: { select: { services: { where: { service: isPublic } } } },
			},
		}),
		prisma.orgWebsite.findMany({
			where: awaitingReview,
			select: {
				id: true,
				url: true,
				orgLocationOnly: true,
				locations: linkedLocations,
				organization: orgSelect,
				_count: { select: { services: { where: { service: isPublic } } } },
			},
		}),
		prisma.orgSocialMedia.findMany({
			where: awaitingReview,
			select: {
				id: true,
				username: true,
				orgLocationOnly: true,
				service: { select: { name: true } },
				locations: linkedLocations,
				organization: orgSelect,
			},
		}),
	])

	const rows = [
		...phones.map((p) =>
			toRow({
				type: 'phone',
				id: p.id,
				value: p.number,
				locationOnly: p.locationOnly,
				links: p.locations,
				ownOrg: p.organization?.organization,
				services: p._count.services,
			})
		),
		...emails.map((e) =>
			toRow({
				type: 'email',
				id: e.id,
				value: e.email,
				locationOnly: e.locationOnly,
				links: e.locations,
				ownOrg: e.organization[0]?.organization,
				services: e._count.services,
			})
		),
		...websites.map((w) =>
			toRow({
				type: 'website',
				id: w.id,
				value: w.url,
				locationOnly: w.orgLocationOnly,
				links: w.locations,
				ownOrg: w.organization,
				services: w._count.services,
			})
		),
		...socials.map((s) =>
			toRow({
				type: 'socialMedia',
				id: s.id,
				value: `${s.service.name} @${s.username}`,
				locationOnly: s.orgLocationOnly,
				links: s.locations,
				ownOrg: s.organization,
			})
		),
	].filter((row): row is LocationContactReviewRow => row !== null)

	// Organizations whose main page shows a phone today. Mirrors orgPhone.forContactInfo's rule for a
	// multi-location organization (every organization on this list has more than one location): a phone
	// stored under the organization shows on its main page unless it's marked location-only. Update this
	// alongside that rule.
	const orgIds = [...new Set(rows.map(({ org }) => org.id))]
	const withMainPagePhone = new Set(
		(
			await prisma.orgPhone.findMany({
				where: {
					...isPublic,
					organization: { organizationId: { in: orgIds } },
					locationOnly: false,
				},
				select: { organization: { select: { organizationId: true } } },
			})
		).map(({ organization }) => organization?.organizationId)
	)
	for (const row of rows) {
		row.org.mainPageHasPhone = withMainPagePhone.has(row.org.id)
	}

	return rows.toSorted(
		(a, b) =>
			a.org.name.localeCompare(b.org.name) || a.type.localeCompare(b.type) || a.value.localeCompare(b.value)
	)
}
export default list
