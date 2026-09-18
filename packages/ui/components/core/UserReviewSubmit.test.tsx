import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '~ui/test/test-utils'

import { UserReviewSubmit } from './UserReviewSubmit'

vi.mock('next/router', () => ({
	useRouter: () => ({
		pathname: '',
		query: { slug: 'test-org' },
		push: vi.fn(),
	}),
}))

// UserAvatar (rendered above the review Textarea) calls next-auth's useSession(), which throws
// without a mounted <SessionProvider> (nothing in this render tree provides one).
vi.mock('next-auth/react', () => ({
	useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
}))

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		organization: {
			getIdFromSlug: { useQuery: vi.fn() },
		},
		review: {
			create: { useMutation: vi.fn() },
		},
		useUtils: vi.fn(),
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const useIdFromSlugMock = vi.mocked(trpc.organization.getIdFromSlug.useQuery)
const useCreateReviewMock = vi.mocked(trpc.review.create.useMutation)
const useUtilsMock = vi.mocked(trpc.useUtils)

describe('UserReviewSubmit', () => {
	it('sets spellCheck on the review text field', () => {
		useIdFromSlugMock.mockReturnValue({ data: { id: 'org_1' }, status: 'success' } as never)
		useCreateReviewMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		useUtilsMock.mockReturnValue({
			organization: { forOrgPage: { invalidate: vi.fn() } },
			location: { forLocationPage: { invalidate: vi.fn() } },
		} as never)

		render(<UserReviewSubmit />)

		expect(screen.getByLabelText('Review this resource')).toHaveAttribute('spellcheck', 'true')
	})
})
