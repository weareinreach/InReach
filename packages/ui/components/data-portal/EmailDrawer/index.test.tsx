import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen, waitFor } from '~ui/test/test-utils'

import { EmailDrawer } from './index'

vi.mock('next/router', () => ({
	useRouter: () => ({
		pathname: '/org/[slug]/edit',
		query: {},
		push: vi.fn(),
	}),
}))

// This drawer's `orgId` comes from `useOrgInfo` (slug -> org lookup), not from a real column on
// OrgEmail - mocked directly here rather than mocking the slug/query chain underneath it.
const ORG_ID = 'orgn_TESTORG0000000000000000'
vi.mock('~ui/hooks/useOrgInfo', () => ({
	useOrgInfo: () => ({ id: ORG_ID, slug: 'test-org' }),
}))

vi.mock('@mantine/notifications', () => ({
	showNotification: vi.fn(),
}))

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		orgEmail: {
			forEditDrawer: { useQuery: vi.fn() },
			update: { useMutation: vi.fn() },
			locationLink: { useMutation: vi.fn() },
		},
		useUtils: vi.fn(),
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const useForEditDrawerMock = vi.mocked(trpc.orgEmail.forEditDrawer.useQuery)
const useUpdateMutationMock = vi.mocked(trpc.orgEmail.update.useMutation)
const useLocationLinkMutationMock = vi.mocked(trpc.orgEmail.locationLink.useMutation)
const useUtilsMock = vi.mocked(trpc.useUtils)

const EMAIL_ID = 'oeml_TEST00000000000000000000'

// Simulates the exact bug this test guards against: the query returning data with no `orgId` at
// all, the way a second open of this drawer in the same session could (see index.tsx's `submitEmail`
// comment) - `orgId` is deliberately absent here and should never come from this data.
const mockEmailData = () => {
	useForEditDrawerMock.mockReturnValue({
		data: {
			id: EMAIL_ID,
			email: 'contact@example.org',
			firstName: null,
			lastName: null,
			primary: false,
			published: true,
			deleted: false,
			titleId: null,
			locationOnly: false,
			serviceOnly: false,
			description: null,
			descriptionId: null,
		},
		isFetching: false,
	} as never)
}

describe('EmailDrawer', () => {
	beforeEach(() => {
		useUtilsMock.mockReturnValue({
			orgEmail: {
				forContactInfoEdit: { invalidate: vi.fn() },
				forContactInfo: { invalidate: vi.fn() },
				forEditDrawer: { invalidate: vi.fn() },
			},
		} as never)
		useLocationLinkMutationMock.mockReturnValue({ mutate: vi.fn() } as never)
	})

	it('always submits the live orgId from useOrgInfo, even when the query data has none (the actual bug)', async () => {
		// Not `.optional()`'d away at the zod level, this scenario would previously fail validation
		// silently (a console.error, no visible feedback) before `mutate` was ever called - see the
		// `orgId` comment on `FormSchema` in index.tsx.
		mockEmailData()
		const mutate = vi.fn()
		useUpdateMutationMock.mockReturnValue({ mutate, isPending: false } as never)

		const user = userEvent.setup()
		render(<EmailDrawer id={EMAIL_ID}>Edit email</EmailDrawer>)
		await user.click(screen.getByRole('button', { name: 'Edit email' }))
		await waitFor(() => screen.getByRole('checkbox', { name: 'Deleted' }))
		await user.click(screen.getByRole('checkbox', { name: 'Deleted' }))
		await user.click(screen.getByRole('button', { name: 'Save' }))

		await waitFor(() => expect(mutate).toHaveBeenCalled())
		expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ orgId: ORG_ID, deleted: true }))
	})
})
