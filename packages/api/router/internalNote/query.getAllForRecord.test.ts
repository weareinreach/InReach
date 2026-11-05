import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: { internalNote: { findMany: vi.fn().mockResolvedValue([]) } },
}))

const { prisma } = await import('@weareinreach/db')
const { default: getAllForRecord } = await import('./query.getAllForRecord.handler')

const findManyMock = vi.mocked(prisma.internalNote.findMany)

describe('internalNote.getAllForRecord', () => {
	it('passes the input straight through as the where clause', async () => {
		await getAllForRecord({ input: { organizationId: 'orgn_test' } } as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: { organizationId: 'orgn_test' } })
		)
	})

	it('includes the note author’s name', async () => {
		await getAllForRecord({ input: { organizationId: 'orgn_test' } } as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({ include: { user: { select: { name: true } } } })
		)
	})
})
