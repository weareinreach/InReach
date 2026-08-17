import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '~ui/test/test-utils'

import { Rating } from './Rating'

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		review: {
			getAverage: {
				useQuery: vi.fn(),
			},
		},
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const useAverageMock = vi.mocked(trpc.review.getAverage.useQuery)

describe('Rating', () => {
	it('shows "No reviews yet" when there are zero reviews', () => {
		useAverageMock.mockReturnValue({ status: 'success', data: { average: null, count: 0 } } as never)

		render(<Rating recordId='org_1' />)

		expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument()
	})

	it('uses the singular form for exactly one review', () => {
		useAverageMock.mockReturnValue({ status: 'success', data: { average: 5, count: 1 } } as never)

		render(<Rating recordId='org_1' />)

		expect(screen.getByText(/1 review\)/i)).toBeInTheDocument()
		expect(screen.queryByText(/1 reviews\)/i)).not.toBeInTheDocument()
	})

	it('uses the plural form for multiple reviews', () => {
		useAverageMock.mockReturnValue({ status: 'success', data: { average: 4.5, count: 3 } } as never)

		render(<Rating recordId='org_1' />)

		expect(screen.getByText(/3 reviews\)/i)).toBeInTheDocument()
	})

	it('renders a loading skeleton while the query is pending', () => {
		useAverageMock.mockReturnValue({ status: 'pending', data: undefined } as never)

		const { container } = render(<Rating recordId='org_1' />)

		expect(container.querySelector('.mantine-Skeleton-root')).toBeInTheDocument()
	})
})
