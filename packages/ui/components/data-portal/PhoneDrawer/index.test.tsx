import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen, waitFor } from '~ui/test/test-utils'

import { PhoneDrawer } from './index'

vi.mock('next/router', () => ({
	useRouter: () => ({ pathname: '/org/[slug]/edit', query: {}, push: vi.fn() }),
}))

vi.mock('~ui/hooks/useOrgInfo', () => ({
	useOrgInfo: () => ({ id: 'orgn_TESTORG0000000000000000', slug: 'test-org' }),
}))

// Not under test here - stubbed out so this file doesn't also need to mock its own internal
// tRPC calls (it queries `fieldOpt.countries` independently of this drawer).
vi.mock('~ui/components/data-portal/PhoneNumberEntry/withHookForm', () => ({
	PhoneNumberEntry: () => null,
}))

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		orgPhone: {
			forEditDrawer: { useQuery: vi.fn() },
			upsert: { useMutation: vi.fn() },
			locationLink: { useMutation: vi.fn() },
		},
		fieldOpt: {
			phoneTypes: { useQuery: vi.fn() },
			countries: { useQuery: vi.fn() },
		},
		useUtils: vi.fn(),
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const useForEditDrawerMock = vi.mocked(trpc.orgPhone.forEditDrawer.useQuery)
const useUpsertMutationMock = vi.mocked(trpc.orgPhone.upsert.useMutation)
const useLocationLinkMutationMock = vi.mocked(trpc.orgPhone.locationLink.useMutation)
const usePhoneTypesMock = vi.mocked(trpc.fieldOpt.phoneTypes.useQuery)
const useCountriesMock = vi.mocked(trpc.fieldOpt.countries.useQuery)
const useUtilsMock = vi.mocked(trpc.useUtils)

const PHONE_ID = 'ophn_TEST00000000000000000000'

describe('PhoneDrawer', () => {
	beforeEach(() => {
		useForEditDrawerMock.mockReturnValue({
			data: {
				id: PHONE_ID,
				number: '+18888439262',
				ext: '',
				primary: false,
				published: true,
				deleted: false,
				countryId: 'ctry_US',
				phoneTypeId: '',
				description: '',
				locationOnly: false,
				serviceOnly: false,
			},
			isFetching: false,
		} as never)
		usePhoneTypesMock.mockReturnValue({ data: [] } as never)
		useCountriesMock.mockReturnValue({
			data: [{ id: 'ctry_US', cca2: 'US', name: 'United States' }],
		} as never)
		useUtilsMock.mockReturnValue({
			orgPhone: {
				forContactInfoEdit: { invalidate: vi.fn(), setData: vi.fn() },
				forContactInfo: { invalidate: vi.fn() },
				forEditDrawer: { invalidate: vi.fn() },
			},
		} as never)
		useLocationLinkMutationMock.mockReturnValue({ mutate: vi.fn() } as never)
	})

	it('does not patch the contact-list cache with unsaved data when the save fails', async () => {
		// Previously `onSettled` ran `patchContactListCaches` (a `setData` call writing the
		// *submitted* values straight into the cache) unconditionally, including on a failed save -
		// the list would show a change that was never actually persisted. It must now be skipped on
		// error - see the `if (error) return` guard and comment in index.tsx.
		const apiUtils = useUtilsMock()
		useUpsertMutationMock.mockImplementation((opts) => {
			const mockMutation = {
				mutate: (variables: unknown) =>
					opts?.onSettled?.(
						undefined,
						new Error('save failed') as never,
						variables as never,
						undefined,
						undefined as never
					),
				isPending: false,
			}
			return mockMutation as never
		})

		const user = userEvent.setup()
		render(<PhoneDrawer opened id={PHONE_ID} onClose={vi.fn()} />)
		await waitFor(() => screen.getByRole('checkbox', { name: 'Deleted' }))
		await user.click(screen.getByRole('checkbox', { name: 'Deleted' }))
		await user.click(screen.getByRole('button', { name: 'Save' }))

		await waitFor(() => expect(useUpsertMutationMock).toHaveBeenCalled())
		expect(apiUtils.orgPhone.forContactInfoEdit.setData).not.toHaveBeenCalled()
	})
})
