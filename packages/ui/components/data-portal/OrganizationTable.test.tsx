import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen } from '~ui/test/test-utils'

import { OrganizationTable } from './OrganizationTable'

// The test wrapper doesn't mount Mantine's `<Notifications />` container, so a real `showNotification`
// call never renders anything to assert on in the DOM - assert the call itself instead.
vi.mock('@mantine/notifications', () => ({ showNotification: vi.fn() }))

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		organization: {
			forOrganizationTable: { useQuery: vi.fn() },
		},
		component: {
			EditModeBarPublish: { useMutation: vi.fn() },
		},
		useUtils: vi.fn(),
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const useForOrgTableMock = vi.mocked(trpc.organization.forOrganizationTable.useQuery)
const useUpdateStatusMock = vi.mocked(trpc.component.EditModeBarPublish.useMutation)
const useUtilsMock = vi.mocked(trpc.useUtils)

const ORG_ROW = {
	id: 'org_1',
	name: 'Riverside Community Health Center',
	slug: 'riverside-community-health-center',
	lastVerified: new Date('2024-03-12'),
	updatedAt: new Date('2024-03-12'),
	createdAt: new Date('2023-01-01'),
	published: true,
	deleted: false,
	locations: [],
	source: null,
	creatorHadDpAccess: false,
	unpublishedReason: null as string | null,
}

const renderTable = (row: typeof ORG_ROW, invalidate = vi.fn()) => {
	useForOrgTableMock.mockReturnValue({
		data: { results: [row], total: 1 },
		isLoading: false,
		isError: false,
		isFetching: false,
	} as never)
	useUtilsMock.mockReturnValue({
		organization: { forOrganizationTable: { invalidate } },
	} as never)
	// `UnpublishReasonPopover` always calls this hook regardless of whether a given test exercises it -
	// give it a harmless default so tests that don't care about the mutation itself don't crash on render.
	if (!useUpdateStatusMock.getMockImplementation()) {
		useUpdateStatusMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
	}
	render(<OrganizationTable />)
	return { invalidate }
}

const pickReason = async (
	user: ReturnType<typeof userEvent.setup>,
	reasonLabel: string,
	reasonValue: string
) => {
	await user.click(screen.getByRole('button', { name: 'Set status' }))
	// Same jsdom/floating-ui quirk covered in UnpublishReasonPopover.test.tsx - the dropdown's content
	// doesn't land in the DOM until a real macrotask runs, which `findByRole`'s own polling never
	// observes on its own.
	await user.click(await screen.findByPlaceholderText('Choose a reason'))
	await new Promise((resolve) => setTimeout(resolve, 50))
	// The toolbar's own Status filter has an option with this same label (lowercase `value`, e.g.
	// "new") - disambiguate by `value`, same as BulkSearchReplaceTable.test.tsx does for this exact
	// kind of same-label, different-dropdown collision.
	const options = screen.getAllByRole('option', { name: reasonLabel, hidden: true })
	const option = options.find((el) => el.getAttribute('value') === reasonValue)
	await user.click(option!)
	await user.click(screen.getByRole('button', { name: 'Done', hidden: true }))
}

describe('OrganizationTable - "Set status" row action', () => {
	beforeEach(() => vi.clearAllMocks())

	it('renders the same "Set status" trigger for a published row (unlike the edit page, this is a single, un-swapped action)', () => {
		renderTable({ ...ORG_ROW, published: true, unpublishedReason: null })
		expect(screen.getByRole('button', { name: 'Set status' })).toBeInTheDocument()
		// The edit page's "Unpublish"/"Publish" wording never applies here - it's always this one action.
		expect(screen.queryByRole('button', { name: 'Unpublish' })).not.toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument()
	})

	it('renders the same trigger for an already-unpublished row too', () => {
		renderTable({ ...ORG_ROW, published: false, unpublishedReason: 'NEW' })
		expect(screen.getByRole('button', { name: 'Set status' })).toBeInTheDocument()
	})

	it('invalidates the organization table query (not EditModeBar - this call site has no such query) on success', async () => {
		const user = userEvent.setup()
		useUpdateStatusMock.mockImplementation((opts) => {
			const onSuccess = opts?.onSuccess as (() => void) | undefined
			const mutation = { mutate: () => onSuccess?.(), isPending: false }
			return mutation as never
		})
		const { invalidate } = renderTable({ ...ORG_ROW, published: true, unpublishedReason: null })

		await pickReason(user, 'New', 'NEW')

		expect(invalidate).toHaveBeenCalledTimes(1)
	})

	it("pre-populates the Select from the row's existing unpublishedReason", async () => {
		const user = userEvent.setup()
		useUpdateStatusMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		renderTable({ ...ORG_ROW, published: false, unpublishedReason: 'INACTIVE' })

		await user.click(screen.getByRole('button', { name: 'Set status' }))
		expect(await screen.findByPlaceholderText('Choose a reason')).toHaveValue('Inactive')
	})
})
