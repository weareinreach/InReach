import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen, waitFor } from '~ui/test/test-utils'

import { EmailDrawer } from './index'

// Split into its own file, not a second `it()` alongside the orgId regression test - Mantine's
// `Drawer` (unlike the `Modal`-based precedent in `DuplicateService/index.test.tsx`) doesn't
// reliably support more than one render-and-interact cycle per test file in this Vitest+jsdom setup:
// the first test in a file always passes, and every subsequent one fails on missing elements or
// mocks that were never called, regardless of what that test actually does. One test per file
// sidesteps it entirely rather than chasing the exact interaction between Drawer/FocusTrap/portal
// teardown and jsdom.
vi.mock('next/router', () => ({
	useRouter: () => ({ pathname: '/org/[slug]/edit', query: {}, push: vi.fn() }),
}))

vi.mock('~ui/hooks/useOrgInfo', () => ({
	useOrgInfo: () => ({ id: 'orgn_TESTORG0000000000000000', slug: 'test-org' }),
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
const { showNotification } = await import('@mantine/notifications')
const useForEditDrawerMock = vi.mocked(trpc.orgEmail.forEditDrawer.useQuery)
const useUpdateMutationMock = vi.mocked(trpc.orgEmail.update.useMutation)
const useLocationLinkMutationMock = vi.mocked(trpc.orgEmail.locationLink.useMutation)
const useUtilsMock = vi.mocked(trpc.useUtils)

const EMAIL_ID = 'oeml_TEST00000000000000000000'

describe('EmailDrawer', () => {
	beforeEach(() => {
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
		useUtilsMock.mockReturnValue({
			orgEmail: {
				forContactInfoEdit: { invalidate: vi.fn() },
				forContactInfo: { invalidate: vi.fn() },
				forEditDrawer: { invalidate: vi.fn() },
			},
		} as never)
		useLocationLinkMutationMock.mockReturnValue({ mutate: vi.fn() } as never)
	})

	it('shows an error notification if the save fails, instead of failing silently', async () => {
		useUpdateMutationMock.mockImplementation((opts) => {
			const mockMutation = {
				mutate: () =>
					opts?.onError?.(
						new Error('save failed') as never,
						undefined as never,
						undefined,
						undefined as never
					),
				isPending: false,
			}
			return mockMutation as never
		})

		const user = userEvent.setup()
		render(<EmailDrawer id={EMAIL_ID}>Edit email</EmailDrawer>)
		await user.click(screen.getByRole('button', { name: 'Edit email' }))
		await waitFor(() => screen.getByRole('checkbox', { name: 'Deleted' }))
		await user.click(screen.getByRole('checkbox', { name: 'Deleted' }))
		await user.click(screen.getByRole('button', { name: 'Save' }))

		await waitFor(() => expect(showNotification).toHaveBeenCalled())
	})
})
