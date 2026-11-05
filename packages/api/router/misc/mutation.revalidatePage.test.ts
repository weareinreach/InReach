import { describe, expect, it } from 'vitest'

import { default as revalidatePage } from './mutation.revalidatePage.handler'

/**
 * Previously this always resolved successfully, even on failure - {revalidated: false, error} was a normal
 * tRPC response, not a thrown error, so every call site (which fired this and discarded the result) never had
 * any way to know a refresh had failed, and Sentry's tRPC middleware (which only captures thrown errors)
 * never saw it either.
 */
describe('misc.revalidatePage - surfaces failures instead of swallowing them', () => {
	it('throws when ctx.res is unavailable', async () => {
		await expect(
			revalidatePage({ ctx: { res: undefined }, input: { path: '/org/some-org' } } as never)
		).rejects.toMatchObject({ code: 'INTERNAL_SERVER_ERROR' })
	})

	it('throws when res.revalidate itself fails', async () => {
		const res = { revalidate: async () => Promise.reject(new Error('boom')) }

		await expect(
			revalidatePage({ ctx: { res }, input: { path: '/org/some-org' } } as never)
		).rejects.toMatchObject({ code: 'INTERNAL_SERVER_ERROR' })
	})

	it('resolves normally when revalidation succeeds', async () => {
		const res = { revalidate: async () => undefined }

		await expect(
			revalidatePage({ ctx: { res }, input: { path: '/org/some-org' } } as never)
		).resolves.toEqual({ revalidated: true })
	})
})
