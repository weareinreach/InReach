import { describe, expect, it } from 'vitest'

import { getCacheControlHeader } from './context'

/**
 * Regression coverage for a real privacy bug: every protected tRPC query's response was getting stamped with
 * a public, shared-cache-eligible `cache-control` header, because the flag meant to prevent that
 * (`markSkipCache`/`getSkipCache`) is set by auth middleware that runs too late relative to when
 * `httpBatchStreamLink` (the only link this app uses) generates response headers. Found via a saved-list item
 * not appearing after being saved until a manual page refresh - the list's contents query was being served a
 * stale, pre-save response from HTTP cache. `getCacheControlHeader` is the extracted decision logic so this
 * is tested directly, without needing a real HTTP request/response pair.
 */
describe('getCacheControlHeader', () => {
	it('does not cache a query response for a signed-in session, even if shouldSkip was not set in time', () => {
		expect(
			getCacheControlHeader({ hasSession: true, shouldSkip: false, allOk: true, isQuery: true })
		).toBeUndefined()
	})

	it('still caches a public (no session) query response - the fix must not disable legitimate public caching', () => {
		expect(getCacheControlHeader({ hasSession: false, shouldSkip: false, allOk: true, isQuery: true })).toBe(
			's-maxage=1, public, stale-while-revalidate=86400'
		)
	})

	it('does not cache when shouldSkip is set, regardless of session (existing behavior preserved)', () => {
		expect(
			getCacheControlHeader({ hasSession: false, shouldSkip: true, allOk: true, isQuery: true })
		).toBeUndefined()
	})

	it('does not cache a response that had an error', () => {
		expect(
			getCacheControlHeader({ hasSession: false, shouldSkip: false, allOk: false, isQuery: true })
		).toBeUndefined()
	})

	it('does not cache a mutation', () => {
		expect(
			getCacheControlHeader({ hasSession: false, shouldSkip: false, allOk: true, isQuery: false })
		).toBeUndefined()
	})
})
