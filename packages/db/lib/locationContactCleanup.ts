/**
 * Shared detection logic for the location-vs-organization contact-info cleanup: which existing phone, email,
 * website and social-media records should be marked "location only" (`OrgPhone.locationOnly`,
 * `OrgEmail.locationOnly`, `OrgWebsite.orgLocationOnly`, `OrgSocialMedia.orgLocationOnly`).
 *
 * The target behavior: an organization's own page shows everything on the org except location-only items; a
 * location's page shows everything linked to it. Records saved before that rule existed were never marked, so
 * this classifies them. Used by both the read-only audit (auditLocationContacts.ts) and the data migration,
 * so the preview and the real change can never disagree.
 */
import { type prisma as prismaClient } from '~db/client'

type PrismaClient = typeof prismaClient

export type ContactType = 'phone' | 'email' | 'website' | 'socialMedia'

export type Classification =
	/** Duplicates an org-level item of the same org - this is the location's copy. Safe to mark automatically. */
	| 'duplicateOfOrgItem'
	/** An email added from a location (linked to the location, never to the org). Safe to mark automatically. */
	| 'emailAddedFromLocation'
	/** Linked to every one of the org's published locations - almost certainly org-wide. Leave unmarked. */
	| 'linkedToEveryLocation'
	/** Already marked location only. Nothing to do. */
	| 'alreadyLocationOnly'
	/**
	 * On a single-location org. Its page shows everything either way (the location is shown inline), so there's
	 * nothing for a person to decide. Leave unmarked.
	 */
	| 'singleLocationOrg'
	/** Can't tell from the data whether it's the location's own or an org item linked to it. A person decides. */
	| 'needsReview'

/**
 * Internal notes the cleanup leaves on contact items (`InternalNote.orgPhoneId`/`orgEmailId`/`orgWebsiteId`/
 * `orgSocialMediaId`). They record what the migration did and which items still need a person, so the data
 * managers' review list can find them afterwards - once an undecided phone is marked location-only it can no
 * longer be told apart from one that always was.
 */
export const CLEANUP_NOTE = {
	prefix: '[location-contact-cleanup]',
	needsReview:
		"[location-contact-cleanup] Needs review: is this the whole organization's, or only for the location(s) it's linked to?",
	markedDuplicate: (orgItemId: string) =>
		`[location-contact-cleanup] Marked location-only: the location's copy of org-level item ${orgItemId}.`,
	markedEmailFromLocation:
		'[location-contact-cleanup] Marked location-only: email added from a location (linked to the location only).',
	markedNeedsReviewPhone:
		"[location-contact-cleanup] Marked location-only until reviewed, so the org's page stays as it was " +
		'(multi-location org pages already hid phones linked to a location).',
	/** Every note a data manager's decision leaves starts with this - the review list leaves those items out. */
	reviewedPrefix: '[location-contact-cleanup] Reviewed:',
	reviewed: (choice: ReviewChoice) =>
		({
			orgAndLocations:
				"[location-contact-cleanup] Reviewed: the organization's - shown on its page and its linked location(s).",
			locationsOnly:
				"[location-contact-cleanup] Reviewed: the location's own - shown on its linked location(s), not the organization's page.",
			orgOnly:
				"[location-contact-cleanup] Reviewed: the organization's only - shown on its page; removed from its location(s).",
		})[choice],
} as const

/** A data manager's answer for one review-list item (see the locationContactReview API router). */
export type ReviewChoice = 'orgAndLocations' | 'locationsOnly' | 'orgOnly'

// --- Matching rules: two items "are the same" when these keys match. ---

/** Digits only, so formatting doesn't matter. A leading US/Canada `1` on an 11-digit number is dropped. */
export const phoneKey = (number: string) => {
	const digits = number.replace(/\D/g, '')
	return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
}

export const emailKey = (email: string) => email.trim().toLowerCase()

/**
 * Same URL ignoring case, `http(s)://`, a leading `www.` and a trailing `/`. Anything from the first `?` or
 * `#` on is kept exactly - those usually mean a different page or a tracking link.
 */
export const urlKey = (url: string) => {
	const trimmed = url.trim()
	const splitAt = trimmed.search(/[?#]/)
	const base = splitAt === -1 ? trimmed : trimmed.slice(0, splitAt)
	const rest = splitAt === -1 ? '' : trimmed.slice(splitAt)
	const normalizedBase = base
		.toLowerCase()
		.replace(/^https?:\/\//, '')
		.replace(/^www\./, '')
		.replace(/\/+$/, '')
	return normalizedBase + rest
}

/** Same platform and username, ignoring case and a leading `@`. */
export const socialKey = (serviceId: string, username: string) =>
	`${serviceId}:${username.trim().replace(/^@/, '').toLowerCase()}`

// --- Classification ---

export interface ContactItem {
	type: ContactType
	id: string
	/** What a person would recognize: the number, address, URL or `platform @username`. */
	display: string
	key: string
	locationOnly: boolean
	/** The org the item belongs to (its own org link, or - for a location-only email - its location's org). */
	orgId: string
	hasOrgLink: boolean
	/** Published, non-deleted locations of its own org that it's linked to. */
	locationIds: string[]
	/**
	 * Linked to any location at all, published or not. An item linked only to an unpublished location is still
	 * that location's copy, not an org-level item (e.g. a location that's been unpublished for now).
	 */
	hasAnyLocationLink: boolean
}

export interface ClassifiedItem extends ContactItem {
	classification: Classification
	/** For `duplicateOfOrgItem`: the org-level item it duplicates. */
	matchesOrgItemId?: string
}

export interface OrgContext {
	id: string
	name: string
	slug: string
	/** Published, non-deleted locations. */
	locations: { id: string; name: string | null; city: string }[]
}

const isPublic = { published: true, deleted: false }
const locationSelect = { id: true, orgId: true, published: true, deleted: true } as const
type LinkedLocation = { location: { id: string; orgId: string; published: boolean; deleted: boolean } }

/** Loads every published contact item that's linked to at least one published location, plus their orgs. */
export const loadLocationLinkedContacts = async (prisma: PrismaClient) => {
	const [phones, emails, websites, socials] = await Promise.all([
		prisma.orgPhone.findMany({
			where: isPublic,
			select: {
				id: true,
				number: true,
				locationOnly: true,
				organization: { select: { organizationId: true } },
				locations: { select: { location: { select: locationSelect } } },
			},
		}),
		prisma.orgEmail.findMany({
			where: isPublic,
			select: {
				id: true,
				email: true,
				locationOnly: true,
				organization: { select: { organizationId: true } },
				locations: { select: { location: { select: locationSelect } } },
			},
		}),
		prisma.orgWebsite.findMany({
			where: isPublic,
			select: {
				id: true,
				url: true,
				orgLocationOnly: true,
				organizationId: true,
				locations: { select: { location: { select: locationSelect } } },
			},
		}),
		prisma.orgSocialMedia.findMany({
			where: isPublic,
			select: {
				id: true,
				url: true,
				username: true,
				serviceId: true,
				orgLocationOnly: true,
				organizationId: true,
				service: { select: { name: true } },
				locations: { select: { location: { select: locationSelect } } },
			},
		}),
	])

	const items: ContactItem[] = []
	const push = (
		base: Omit<ContactItem, 'orgId' | 'hasOrgLink' | 'locationIds' | 'hasAnyLocationLink'>,
		orgLinkId: string | null | undefined,
		allLocations: LinkedLocation[]
	) => {
		const locations = allLocations.filter(({ location }) => location.published && !location.deleted)
		const orgId = orgLinkId ?? locations[0]?.location.orgId ?? allLocations[0]?.location.orgId
		if (!orgId) {
			return
		}
		items.push({
			...base,
			orgId,
			hasOrgLink: Boolean(orgLinkId),
			locationIds: locations
				.filter(({ location }) => location.orgId === orgId)
				.map(({ location }) => location.id),
			hasAnyLocationLink: allLocations.length > 0,
		})
	}

	for (const p of phones) {
		push(
			{ type: 'phone', id: p.id, display: p.number, key: phoneKey(p.number), locationOnly: p.locationOnly },
			p.organization?.organizationId,
			p.locations
		)
	}
	for (const e of emails) {
		push(
			{ type: 'email', id: e.id, display: e.email, key: emailKey(e.email), locationOnly: e.locationOnly },
			e.organization[0]?.organizationId,
			e.locations
		)
	}
	for (const w of websites) {
		push(
			{ type: 'website', id: w.id, display: w.url, key: urlKey(w.url), locationOnly: w.orgLocationOnly },
			w.organizationId,
			w.locations
		)
	}
	for (const s of socials) {
		push(
			{
				type: 'socialMedia',
				id: s.id,
				display: `${s.service.name} @${s.username}`,
				key: socialKey(s.serviceId, s.username),
				locationOnly: s.orgLocationOnly,
			},
			s.organizationId,
			s.locations
		)
	}

	const orgIds = [...new Set(items.map(({ orgId }) => orgId))]
	const orgs = await prisma.organization.findMany({
		where: { id: { in: orgIds }, ...isPublic },
		select: {
			id: true,
			name: true,
			slug: true,
			locations: { where: isPublic, select: { id: true, name: true, city: true } },
		},
	})
	return { items, orgs: new Map<string, OrgContext>(orgs.map((org) => [org.id, org])) }
}

/** Classifies every location-linked item. Org-level items with no location link are only used for matching. */
export const classifyLocationContacts = (items: ContactItem[], orgs: Map<string, OrgContext>) => {
	const orgLevelByKey = new Map<string, ContactItem>()
	for (const item of items) {
		if (!item.hasAnyLocationLink && item.hasOrgLink && !item.locationOnly) {
			orgLevelByKey.set(`${item.orgId}|${item.type}|${item.key}`, item)
		}
	}

	const classified: ClassifiedItem[] = []
	for (const item of items) {
		const org = orgs.get(item.orgId)
		if (!org || item.locationIds.length === 0) {
			continue
		}
		const orgCopy = orgLevelByKey.get(`${item.orgId}|${item.type}|${item.key}`)
		const isMultiLocation = org.locations.length > 1
		const linkedToAll = isMultiLocation && org.locations.every(({ id }) => item.locationIds.includes(id))

		let classification: Classification
		if (item.locationOnly) {
			classification = 'alreadyLocationOnly'
		} else if (orgCopy && orgCopy.id !== item.id) {
			// Checked before "linked to every location": a location copy of an org-level item would otherwise
			// show twice on the org's page once phones use the location-only flag.
			classification = 'duplicateOfOrgItem'
		} else if (linkedToAll) {
			classification = 'linkedToEveryLocation'
		} else if (item.type === 'email' && !item.hasOrgLink) {
			classification = 'emailAddedFromLocation'
		} else if (isMultiLocation) {
			classification = 'needsReview'
		} else {
			classification = 'singleLocationOrg'
		}
		classified.push({
			...item,
			classification,
			...(classification === 'duplicateOfOrgItem' && orgCopy ? { matchesOrgItemId: orgCopy.id } : {}),
		})
	}
	return classified
}

export interface CleanupPlan {
	/** Items to mark location-only, each with the note recording why. */
	mark: { item: ClassifiedItem; note: string }[]
	/** Items for a person to decide - each gets the "needs review" note (and is also in `mark` if a phone). */
	needsReview: ClassifiedItem[]
}

/**
 * What the migration does with each classified item. Kept separate from the classification so the preview
 * (auditLocationContacts.ts) reports exactly what the migration will write.
 *
 * Undecided items keep the org page looking the way it does today: phones are marked location-only (a
 * multi-location org's page already hides phones linked to a location), while emails, websites and social
 * media stay unmarked (their org pages already show them).
 */
export const planCleanup = (classified: ClassifiedItem[]): CleanupPlan => {
	const plan: CleanupPlan = { mark: [], needsReview: [] }
	for (const item of classified) {
		switch (item.classification) {
			case 'duplicateOfOrgItem': {
				plan.mark.push({ item, note: CLEANUP_NOTE.markedDuplicate(item.matchesOrgItemId ?? 'unknown') })
				break
			}
			case 'emailAddedFromLocation': {
				plan.mark.push({ item, note: CLEANUP_NOTE.markedEmailFromLocation })
				break
			}
			case 'needsReview': {
				plan.needsReview.push(item)
				if (item.type === 'phone') {
					plan.mark.push({ item, note: CLEANUP_NOTE.markedNeedsReviewPhone })
				}
				break
			}
			default: {
				break
			}
		}
	}
	return plan
}
