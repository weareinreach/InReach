import { describe, expect, it } from 'vitest'

import { orgSearchSelect } from './org'

/**
 * Regression: the search results' nested `services` and `locations` relations had no `where` at all, so a
 * search match on a visible org also pulled in every one of its OTHER locations and services regardless of
 * their own published/deleted status - including every service linked to each of those locations (via
 * `OrgLocationService`, a to-many join - `OrgLocationService.service` itself is a to-one relation and can't
 * be filtered directly, so the filter has to live on the join's own `where`).
 */
describe('orgSearchSelect - does not leak hidden siblings of a visible org', () => {
	it('filters the org-level services relation to published/non-deleted', () => {
		expect(orgSearchSelect.services.where).toEqual({ published: true, deleted: false })
	})

	it('filters the locations relation to published/non-deleted', () => {
		expect(orgSearchSelect.locations.where).toEqual({ published: true, deleted: false })
	})

	it('filters each location’s linked services to ones whose service is published/non-deleted', () => {
		expect(orgSearchSelect.locations.select.services.where).toEqual({
			service: { published: true, deleted: false },
		})
	})
})
