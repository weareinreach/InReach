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

const linkedLocations = {
	where: { location: isPublic },
	select: {
		location: {
			select: {
				id: true,
				name: true,
				city: true,
				organization: {
					select: {
						id: true,
						name: true,
						slug: true,
						_count: { select: { locations: { where: isPublic } } },
					},
				},
			},
		},
	},
} as const

type LinkedLocation = {
	location: {
		id: string
		name: string | null
		city: string
		organization: { id: string; name: string; slug: string; _count: { locations: number } }
	}
}

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
	locations: { id: string; name: string }[]
}

const toRow = (
	type: ContactType,
	id: string,
	value: string,
	locationOnly: boolean,
	links: LinkedLocation[]
): LocationContactReviewRow | null => {
	const org = links[0]?.location.organization
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
	}
}

/**
 * The data managers' review list: every location-linked contact item the cleanup migration couldn't decide on
 * by itself, one row per item, until someone decides it (locationContactReview.decide).
 */
const list = async () => {
	const [phones, emails, websites, socials] = await Promise.all([
		prisma.orgPhone.findMany({
			where: awaitingReview,
			select: { id: true, number: true, locationOnly: true, locations: linkedLocations },
		}),
		prisma.orgEmail.findMany({
			where: awaitingReview,
			select: { id: true, email: true, locationOnly: true, locations: linkedLocations },
		}),
		prisma.orgWebsite.findMany({
			where: awaitingReview,
			select: { id: true, url: true, orgLocationOnly: true, locations: linkedLocations },
		}),
		prisma.orgSocialMedia.findMany({
			where: awaitingReview,
			select: {
				id: true,
				username: true,
				orgLocationOnly: true,
				service: { select: { name: true } },
				locations: linkedLocations,
			},
		}),
	])

	const rows = [
		...phones.map((p) => toRow('phone', p.id, p.number, p.locationOnly, p.locations)),
		...emails.map((e) => toRow('email', e.id, e.email, e.locationOnly, e.locations)),
		...websites.map((w) => toRow('website', w.id, w.url, w.orgLocationOnly, w.locations)),
		...socials.map((s) =>
			toRow('socialMedia', s.id, `${s.service.name} @${s.username}`, s.orgLocationOnly, s.locations)
		),
	].filter((row): row is LocationContactReviewRow => row !== null)

	// Organizations whose main page shows a phone today. Mirrors orgPhone.forContactInfo's rule for a
	// multi-location organization (every organization on this list has more than one location): a phone
	// attached to the organization shows on its main page only when it isn't linked to any of its published
	// locations. Update this alongside that rule.
	const orgIds = [...new Set(rows.map(({ org }) => org.id))]
	const withMainPagePhone = new Set(
		(
			await prisma.orgPhone.findMany({
				where: {
					...isPublic,
					organization: { organizationId: { in: orgIds } },
					locations: { none: { location: isPublic } },
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
