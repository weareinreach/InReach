import { describe, expect, it } from 'vitest'

import {
	type ClassifiedItem,
	classifyLocationContacts,
	CLEANUP_NOTE,
	type ContactItem,
	type OrgContext,
	phoneKey,
	planCleanup,
	urlKey,
} from '@weareinreach/db/lib/locationContactCleanup'

/**
 * Unit tests for the detection behind the 2026-10-19 location-contact-cleanup data migration and its preview
 * (`pnpm --filter @weareinreach/db db:audit-location-contacts`). packages/db has no test runner of its own,
 * so these live here - same as permissions.test.ts testing `@weareinreach/db/lib/rootTierPermissions`. Pure
 * functions only: no database.
 */

const multiOrg: OrgContext = {
	id: 'org_multi',
	name: 'Multi',
	slug: 'multi',
	locations: [
		{ id: 'loc_a', name: 'A', city: 'A' },
		{ id: 'loc_b', name: 'B', city: 'B' },
		{ id: 'loc_c', name: 'C', city: 'C' },
	],
}
const singleOrg: OrgContext = {
	id: 'org_single',
	name: 'Single',
	slug: 'single',
	locations: [{ id: 'loc_solo', name: 'Solo', city: 'Solo' }],
}
const orgs = new Map([multiOrg, singleOrg].map((org) => [org.id, org]))

const item = (overrides: Partial<ContactItem> & Pick<ContactItem, 'id'>): ContactItem => ({
	type: 'phone',
	display: '323-286-7224',
	key: '3232867224',
	locationOnly: false,
	orgId: multiOrg.id,
	hasOrgLink: true,
	locationIds: ['loc_a'],
	hasAnyLocationLink: true,
	...overrides,
})
/** An org-level item: on the org, linked to no location at all. */
const orgLevel = (overrides: Partial<ContactItem> & Pick<ContactItem, 'id'>) =>
	item({ locationIds: [], hasAnyLocationLink: false, ...overrides })

const classify = (items: ContactItem[]) => {
	const byId = new Map(classifyLocationContacts(items, orgs).map((classified) => [classified.id, classified]))
	return (id: string) => byId.get(id)?.classification
}

describe('matching keys', () => {
	it('phones match on digits only, ignoring a leading US/Canada 1', () => {
		expect(phoneKey('+1 (323) 286-7224')).toBe(phoneKey('323.286.7224'))
	})

	it('URLs match ignoring case, http(s)://, www. and a trailing slash - but not a different query string', () => {
		expect(urlKey('HTTPS://www.Example.org/Help/')).toBe(urlKey('http://example.org/help'))
		expect(urlKey('https://example.org/help?ref=a')).not.toBe(urlKey('https://example.org/help?ref=b'))
	})
})

describe('classifyLocationContacts', () => {
	it("a location's copy of an org-level item is a duplicate (marked automatically)", () => {
		const of = classify([orgLevel({ id: 'org_copy' }), item({ id: 'loc_copy' })])

		expect(of('loc_copy')).toBe('duplicateOfOrgItem')
	})

	it('a copy linked only to an unpublished location is not treated as the org-level copy', () => {
		// Foundation 2 in the local data: each location had its own copy, one location unpublished.
		const unpublishedLocationsCopy = orgLevel({ id: 'unpublished_copy', hasAnyLocationLink: true })
		const of = classify([unpublishedLocationsCopy, item({ id: 'loc_copy' })])

		expect(of('loc_copy')).toBe('needsReview')
	})

	it("being listed at every location doesn't make an item the organization's - a person still decides", () => {
		const everywhere = { locationIds: ['loc_a', 'loc_b', 'loc_c'] }
		const of = classify([
			item({ id: 'phone_everywhere', ...everywhere }),
			item({ id: 'email_everywhere', type: 'email', hasOrgLink: false, ...everywhere }),
			orgLevel({ id: 'org_copy', key: 'dup' }),
			item({ id: 'dup_everywhere', key: 'dup', ...everywhere }),
		])

		expect(of('phone_everywhere')).toBe('needsReview')
		// Still never attached to the org, wherever it's listed.
		expect(of('email_everywhere')).toBe('emailAddedFromLocation')
		expect(of('dup_everywhere')).toBe('duplicateOfOrgItem')
	})

	it('an email added from a location (no org link) is marked automatically', () => {
		const of = classify([item({ id: 'email_from_loc', type: 'email', hasOrgLink: false })])

		expect(of('email_from_loc')).toBe('emailAddedFromLocation')
	})

	it('a single-location org never needs review - its page shows everything either way', () => {
		const of = classify([item({ id: 'solo_phone', orgId: singleOrg.id, locationIds: ['loc_solo'] })])

		expect(of('solo_phone')).toBe('singleLocationOrg')
	})

	it('an item already marked location-only is left alone', () => {
		const of = classify([item({ id: 'marked', locationOnly: true })])

		expect(of('marked')).toBe('alreadyLocationOnly')
	})

	it('marked location-only but linked to no location: a person decides', () => {
		const noLocation = { locationIds: [], hasAnyLocationLink: false, locationOnly: true }
		const of = classify([
			item({ id: 'phone_nowhere', ...noLocation }),
			// Linked only to an unpublished location: it stays with that location - nothing to decide.
			item({ id: 'phone_unpublished_location', ...noLocation, hasAnyLocationLink: true }),
			item({ id: 'solo_nowhere', ...noLocation, orgId: singleOrg.id }),
		])

		expect(of('phone_nowhere')).toBe('locationOnlyWithoutLocation')
		expect(of('phone_unpublished_location')).toBeUndefined()
		expect(of('solo_nowhere')).toBeUndefined()
	})

	it('on a multi-location org, an org-linked item on some locations needs a person', () => {
		const of = classify([item({ id: 'phone_some', locationIds: ['loc_a', 'loc_b'] })])

		expect(of('phone_some')).toBe('needsReview')
	})
})

describe('planCleanup', () => {
	const classified = (
		overrides: Partial<ClassifiedItem> & Pick<ClassifiedItem, 'id' | 'classification'>
	): ClassifiedItem => ({ ...item({ id: overrides.id }), ...overrides })

	it('marks duplicates and location-added emails, each with a note saying why', () => {
		const plan = planCleanup([
			classified({ id: 'dup', classification: 'duplicateOfOrgItem', matchesOrgItemId: 'org_copy' }),
			classified({ id: 'email', type: 'email', classification: 'emailAddedFromLocation' }),
		])

		expect(plan.mark).toEqual([
			{ item: expect.objectContaining({ id: 'dup' }), note: CLEANUP_NOTE.markedDuplicate('org_copy') },
			{ item: expect.objectContaining({ id: 'email' }), note: CLEANUP_NOTE.markedEmailFromLocation },
		])
		expect(plan.needsReview).toEqual([])
	})

	it("undecided items keep today's org page: phones are marked location-only, the other types are not", () => {
		const plan = planCleanup([
			classified({ id: 'phone', classification: 'needsReview' }),
			classified({ id: 'email', type: 'email', classification: 'needsReview' }),
			classified({ id: 'website', type: 'website', classification: 'needsReview' }),
			classified({ id: 'social', type: 'socialMedia', classification: 'needsReview' }),
		])

		expect(plan.needsReview.map(({ id }) => id)).toEqual(['phone', 'email', 'website', 'social'])
		expect(plan.mark).toEqual([
			{ item: expect.objectContaining({ id: 'phone' }), note: CLEANUP_NOTE.markedNeedsReviewPhone },
		])
	})

	it('clears the mark on a location-only item with no location, keeping the org page as it was, and flags it', () => {
		const plan = planCleanup([classified({ id: 'nowhere', classification: 'locationOnlyWithoutLocation' })])

		expect(plan.unmark).toEqual([
			{ item: expect.objectContaining({ id: 'nowhere' }), note: CLEANUP_NOTE.unmarkedWithoutLocation },
		])
		expect(plan.needsReview.map(({ id }) => id)).toEqual(['nowhere'])
		expect(plan.mark).toEqual([])
	})

	it('writes nothing for items it leaves alone', () => {
		const plan = planCleanup([
			classified({ id: 'a', classification: 'alreadyLocationOnly' }),
			classified({ id: 'c', classification: 'singleLocationOrg' }),
		])

		expect(plan).toEqual({ mark: [], unmark: [], needsReview: [] })
	})
})
