import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen } from '~ui/test/test-utils'

import { OrganizationTable } from './OrganizationTable'

// The test wrapper doesn't mount Mantine's `<Notifications />` container, so a real `showNotification`
// call never renders anything to assert on in the DOM - assert the call itself instead.
vi.mock('@mantine/notifications', () => ({ showNotification: vi.fn() }))

// `RowAction` imports `AuditDrawer`/`InternalNotesDrawer` (rendered only once `auditOpen`/`notesOpen` is
// true, neither of which any test here flips) - but the plain `import` alone is enough to pull in
// `ModalTitle` -> Breadcrumb, which forms a circular import through the modals directory that crashes
// Vitest's SSR module loader when the generated Prisma client isn't present, as in CI (see
// InternalNotesDrawer.test.tsx, which hits the identical chain and needs the identical stub).
vi.mock('next/router', () => ({
	useRouter: () => ({ pathname: '', query: {}, push: vi.fn() }),
}))
vi.mock('~ui/modals/ModalTitle', () => ({ ModalTitle: () => null }))
vi.mock('next-auth/react', () => ({ useSession: vi.fn() }))

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		organization: {
			forOrganizationTable: { useQuery: vi.fn() },
			// Backs the Community/Leader Badge toolbar quick filters - called unconditionally on every
			// render (unlike the Created-By type-ahead, which only queries once its popover is opened), so
			// every test needs a stub even if it never touches these filters.
			badgeOptions: { useQuery: vi.fn() },
		},
		component: {
			EditModeBarPublish: { useMutation: vi.fn() },
			// Backs the Service Tags toolbar quick filter - same "called unconditionally" reasoning.
			ServiceSelect: { useQuery: vi.fn() },
		},
		// Backs the Service Attributes toolbar quick filter - same "called unconditionally" reasoning.
		fieldOpt: {
			attributesForFilter: { useQuery: vi.fn() },
		},
		useUtils: vi.fn(),
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const useForOrgTableMock = vi.mocked(trpc.organization.forOrganizationTable.useQuery)
const useUpdateStatusMock = vi.mocked(trpc.component.EditModeBarPublish.useMutation)
const useBadgeOptionsMock = vi.mocked(trpc.organization.badgeOptions.useQuery)
const useServiceSelectMock = vi.mocked(trpc.component.ServiceSelect.useQuery)
const useAttributesForFilterMock = vi.mocked(trpc.fieldOpt.attributesForFilter.useQuery)
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
	// Populated by ORG_SELECT/withServiceSummaries in the real handler - the Community/Leader Badge/Service
	// Tags/Service Attributes/Remote Options table columns read these directly (see createPillListCell).
	attributeIds: [] as string[],
	serviceIds: [] as string[],
	serviceAttributeIds: [] as string[],
	remoteOptions: [] as string[],
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
		internalNote: { getAllForRecord: { invalidate: vi.fn() } },
	} as never)
	// `UnpublishReasonPopover` always calls this hook regardless of whether a given test exercises it -
	// give it a harmless default so tests that don't care about the mutation itself don't crash on render.
	if (!useUpdateStatusMock.getMockImplementation()) {
		useUpdateStatusMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
	}
	// The Community/Leader Badge/Service Tags/Service Attributes toolbar quick filters all query their
	// options unconditionally on every render (unlike the Created-By type-ahead, which only queries once
	// its own popover opens) - harmless empty defaults so tests that don't touch these filters don't crash.
	useBadgeOptionsMock.mockReturnValue({ data: [], isLoading: false } as never)
	useServiceSelectMock.mockReturnValue({ data: [], isLoading: false } as never)
	useAttributesForFilterMock.mockReturnValue({ data: [], isLoading: false } as never)
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

describe('OrganizationTable - "+ Filter" menu', () => {
	beforeEach(() => vi.clearAllMocks())

	it('adding Community from the "+ Filter" menu does not crash even when an attribute nests under more than one parent', async () => {
		const user = userEvent.setup()
		useBadgeOptionsMock.mockImplementation(((input: { badgeType: string }) => {
			const communityData =
				input.badgeType === 'service-focus'
					? [
							{
								id: 'attr_parent1',
								name: 'Trans Health',
								children: [
									{ id: 'attr_shared', name: 'Hormone Therapy' },
									{ id: 'attr_child2', name: 'Gender-affirming Surgery' },
								],
							},
							{
								id: 'attr_parent2',
								name: 'Youth Services',
								// `AttributeNesting` allows a child under more than one parent - this is
								// exactly the shape that crashed Mantine's MultiSelect ("Duplicate options are
								// not supported") before the dedup fix in GroupedMultiSelect.
								children: [{ id: 'attr_shared', name: 'Hormone Therapy' }],
							},
						]
					: []
			return { data: communityData, isLoading: false }
		}) as never)
		renderTable({ ...ORG_ROW })

		await user.click(screen.getByRole('button', { name: 'Add filter' }))
		await user.click(await screen.findByRole('menuitem', { name: 'Community' }))

		// Disambiguates from the table's own (now auto-shown) "Community" column header - this checks that
		// the toolbar widget itself rendered, not just that the word "Community" appears somewhere.
		expect(await screen.findByRole('button', { name: 'Remove Community filter' })).toBeInTheDocument()
	})
})

describe('OrganizationTable - locationPhoneCleanupOnly', () => {
	beforeEach(() => vi.clearAllMocks())

	const setup = (locationPhoneCleanupOnly?: boolean) => {
		useForOrgTableMock.mockReturnValue({
			data: { results: [], total: 0 },
			isLoading: false,
			isError: false,
			isFetching: false,
		} as never)
		useUtilsMock.mockReturnValue({
			organization: { forOrganizationTable: { invalidate: vi.fn() } },
			internalNote: { getAllForRecord: { invalidate: vi.fn() } },
		} as never)
		useBadgeOptionsMock.mockReturnValue({ data: [], isLoading: false } as never)
		useServiceSelectMock.mockReturnValue({ data: [], isLoading: false } as never)
		useAttributesForFilterMock.mockReturnValue({ data: [], isLoading: false } as never)
		render(<OrganizationTable locationPhoneCleanupOnly={locationPhoneCleanupOnly} />)
	}

	it('passes needsLocationPhoneCleanup: true through to the query when the prop is set', () => {
		setup(true)
		const [input] = useForOrgTableMock.mock.calls[0] as [{ needsLocationPhoneCleanup?: boolean }]
		expect(input.needsLocationPhoneCleanup).toBe(true)
	})

	it('omits needsLocationPhoneCleanup (rather than sending false) when the prop is not set, so the default org table is unaffected', () => {
		setup()
		const [input] = useForOrgTableMock.mock.calls[0] as [{ needsLocationPhoneCleanup?: boolean }]
		expect(input.needsLocationPhoneCleanup).toBeUndefined()
	})
})
