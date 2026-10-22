import { describe, expect, it, vi } from 'vitest'

import { render, screen, within } from '~ui/test/test-utils'

// `?reportId=` opens that report's details directly (the page's deep-link path), so no row clicking needed.
vi.mock('next/router', () => ({
	useRouter: () => ({
		query: { reportId: 'rprt_01H00000000000000000000001' },
		isReady: true,
		pathname: '/data-portal/reports',
		replace: vi.fn(),
		push: vi.fn(),
	}),
}))

const sessionPermissions = vi.hoisted(() => ({ current: [] as string[] }))
vi.mock('next-auth/react', () => ({
	useSession: () => ({
		data: { user: { id: 'user_test', email: 'staff@example.org', permissions: sessionPermissions.current } },
		status: 'authenticated',
	}),
}))

const report = {
	id: 'rprt_01H00000000000000000000001',
	organizationId: 'orgn_test',
	orgNameSnapshot: 'Test Org',
	serviceId: null,
	serviceNameSnapshot: null,
	issueType: 'incorrect-info',
	status: 'PENDING',
	informed: true,
	userEmail: null,
	userName: null,
	userNote: 'The phone number is wrong.',
	incorrectFields: [],
	internalNotes: [],
	language: null,
	createdAt: new Date('2026-10-01T00:00:00Z'),
	updatedAt: new Date('2026-10-01T00:00:00Z'),
	organization: { slug: 'test-org', name: 'Test Org' },
	reportedBy: null,
	handledBy: null,
}

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		useUtils: () => ({ report: { forReportsTable: { invalidate: vi.fn() } } }),
		report: {
			forReportsTable: {
				useQuery: () => ({
					data: { results: [report], total: 1 },
					isLoading: false,
					isError: false,
					isFetching: false,
				}),
			},
			update: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
		},
	},
}))

const { ReportTable } = await import('./ReportTable')

const openDetails = async () => {
	render(<ReportTable />)
	return within(await screen.findByRole('dialog'))
}

/**
 * #2106: Basic staff can now load the Reports table, but changing a report stays Manager+ (`report.update`).
 * Below Manager, a report's details open read-only instead of showing controls whose save would be rejected.
 */
describe('ReportTable - report details by tier', () => {
	it('Basic staff see the report read-only, with no status control, note field or Save', async () => {
		sessionPermissions.current = ['dataPortalBasic']
		const dialog = await openDetails()

		expect(dialog.getByText('The phone number is wrong.')).toBeInTheDocument()
		expect(dialog.getByText('Pending')).toBeInTheDocument()
		expect(dialog.getByText('Yes')).toBeInTheDocument()
		expect(dialog.getByText('Only Data Portal Managers and above can update a report.')).toBeInTheDocument()
		expect(dialog.queryByRole('textbox', { name: /note/i })).not.toBeInTheDocument()
		expect(dialog.queryByRole('checkbox', { name: 'User Informed' })).not.toBeInTheDocument()
		expect(dialog.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument()
	})

	it.each([['dataPortalManager'], ['dataPortalAdmin']])('%s gets the editable controls', async (perm) => {
		sessionPermissions.current = [perm]
		const dialog = await openDetails()

		expect(dialog.getByRole('textbox', { name: 'Internal Note' })).toBeInTheDocument()
		expect(dialog.getByRole('checkbox', { name: 'User Informed' })).toBeChecked()
		expect(dialog.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
		expect(
			dialog.queryByText('Only Data Portal Managers and above can update a report.')
		).not.toBeInTheDocument()
	})
})
