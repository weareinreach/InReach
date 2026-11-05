import { describe, expect, it, vi } from 'vitest'

import { ZCreateSchema } from './mutation.create.schema'

const createMock = vi.fn().mockResolvedValue({ id: 'orvw_test' })
vi.mock('@weareinreach/db', () => ({
	getAuditedClient: () => ({ orgReview: { create: createMock } }),
}))

const { default: create } = await import('./mutation.create.handler')

/**
 * Regression: `toxicity`/`langConfidence` are meant to be computed server-side by a moderation service
 * (Perspective API) - nothing in this codebase actually calls that API, so accepting them as client input let
 * a reviewer set their own "this review isn't toxic" score.
 */
describe('review.create - toxicity/langConfidence are not accepted as client input', () => {
	it('strips toxicity and langConfidence from the validated input', () => {
		const parsed = ZCreateSchema.parse({
			rating: 5,
			organizationId: 'orgn_test',
			toxicity: 0,
			langConfidence: 1,
		})

		expect(parsed).not.toHaveProperty('toxicity')
		expect(parsed).not.toHaveProperty('langConfidence')
	})

	it('never passes toxicity/langConfidence through to the database write', async () => {
		await create({
			ctx: { actorId: 'user_test', session: { user: { id: 'user_test' } } },
			input: { rating: 5, organizationId: 'orgn_test' },
		} as never)

		const call = createMock.mock.calls.at(-1)?.[0]
		expect(call?.data).not.toHaveProperty('toxicity')
		expect(call?.data).not.toHaveProperty('langConfidence')
	})
})
