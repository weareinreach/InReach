import { describe, expect, it } from 'vitest'

import { ZEditModeBarPublishSchema } from './mutation.EditModeBarPublish.schema'

describe('ZEditModeBarPublishSchema - Organization branch', () => {
	it('rejects unpublishing without a reason', () => {
		const result = ZEditModeBarPublishSchema.safeParse({ slug: 'org-1', published: false })

		expect(result.success).toBe(false)
	})

	it('accepts unpublishing with a reason', () => {
		const result = ZEditModeBarPublishSchema.safeParse({
			slug: 'org-1',
			published: false,
			unpublishedReason: 'NEW',
		})

		expect(result.success).toBe(true)
	})

	it('accepts an optional note alongside the reason', () => {
		const result = ZEditModeBarPublishSchema.safeParse({
			slug: 'org-1',
			published: false,
			unpublishedReason: 'NEW',
			note: 'followed up by email',
		})

		expect(result.success).toBe(true)
	})

	it('accepts publishing with no reason at all', () => {
		const result = ZEditModeBarPublishSchema.safeParse({ slug: 'org-1', published: true })

		expect(result.success).toBe(true)
	})
})

describe('ZEditModeBarPublishSchema - OrgLocation/OrgService branches', () => {
	it('accepts a plain OrgLocation toggle with no reason field at all', () => {
		const result = ZEditModeBarPublishSchema.safeParse({ orgLocationId: 'oloc_1', published: false })

		expect(result.success).toBe(true)
	})

	it('accepts a plain OrgService toggle with no reason field at all', () => {
		const result = ZEditModeBarPublishSchema.safeParse({ orgServiceId: 'osvc_1', published: false })

		expect(result.success).toBe(true)
	})
})
