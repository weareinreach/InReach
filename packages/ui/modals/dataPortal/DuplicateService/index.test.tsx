import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen, waitFor } from '~ui/test/test-utils'

import { DuplicateServiceModal } from './index'

// ModalTitle -> Breadcrumb calls next/router's useRouter(), which throws without a mounted
// RouterContext (nothing in this render tree provides one) - stub it, same as any other test
// rendering a component that pulls in Breadcrumb would need to.
vi.mock('next/router', () => ({
	useRouter: () => ({
		pathname: '',
		query: {},
		push: vi.fn(),
	}),
}))

// ModalTitle transitively imports ActionButtons, which (via QuickPromotion/LoginSignUp/
// ForgotPassword/PrivacyStatement - all of which import ModalTitle back) forms a real circular
// import already present in this codebase's modals directory, unrelated to this feature. In CI
// (where `pnpm install --ignore-scripts` skips `prisma generate`, so no generated Prisma client
// exists), resolving that cycle makes Vitest's SSR module loader eagerly try to load the real
// `@prisma/client` and crash with "Cannot find module '.prisma/client/default'" - reproduced
// locally by running this suite against a fresh `pnpm install --ignore-scripts` in an isolated
// worktree, matching CI exactly. Stubbing ModalTitle here sidesteps that whole chain; nothing in
// this file asserts on the close-breadcrumb button ModalTitle renders.
vi.mock('~ui/modals/ModalTitle', () => ({
	ModalTitle: () => null,
}))

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		service: {
			forDuplicateWizard: { useQuery: vi.fn() },
			duplicate: { useMutation: vi.fn() },
		},
		useUtils: vi.fn(),
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const useForDuplicateWizardMock = vi.mocked(trpc.service.forDuplicateWizard.useQuery)
const useDuplicateMutationMock = vi.mocked(trpc.service.duplicate.useMutation)
const useUtilsMock = vi.mocked(trpc.useUtils)

const SOURCE_SERVICE_ID = 'osvc_SOURCE00000000000000000'
const TWO_LOCATIONS = [
	{ id: 'oloc_1', name: 'Downtown' },
	{ id: 'oloc_2', name: 'Uptown' },
]

const mockWizardData = (
	overrides: Partial<{ name: string; locations: { id: string; name: string }[] }> = {}
) => {
	useForDuplicateWizardMock.mockReturnValue({
		data: { name: 'Legal Aid Clinic', locations: [], ...overrides },
	} as never)
}

const openWizard = async () => {
	const user = userEvent.setup()
	render(<DuplicateServiceModal sourceServiceId={SOURCE_SERVICE_ID}>Copy</DuplicateServiceModal>)
	await user.click(screen.getByRole('button', { name: 'Copy' }))
	await waitFor(() => screen.getByLabelText(/service name/i))
	return user
}

describe('DuplicateServiceModal', () => {
	beforeEach(() => {
		useUtilsMock.mockReturnValue({
			location: { invalidate: vi.fn() },
			service: { invalidate: vi.fn() },
		} as never)
	})

	it('shows "Copy of <source name>" as a placeholder, not an actual value', async () => {
		mockWizardData({ name: 'Legal Aid Clinic' })
		useDuplicateMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)

		await openWizard()

		const nameInput = screen.getByLabelText(/service name/i)
		expect(nameInput).toHaveValue('')
		expect(nameInput).toHaveAttribute('placeholder', 'Copy of Legal Aid Clinic')
	})

	it('collapses an existing "Copy of " prefix in the placeholder instead of stacking it', async () => {
		mockWizardData({ name: 'Copy of Legal Aid Clinic' })
		useDuplicateMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)

		await openWizard()

		expect(screen.getByLabelText(/service name/i)).toHaveAttribute('placeholder', 'Copy of Legal Aid Clinic')
	})

	it('blocks confirming until a real name is typed - the placeholder alone does not count', async () => {
		mockWizardData()
		const mutate = vi.fn()
		useDuplicateMutationMock.mockReturnValue({ mutate, isPending: false } as never)

		await openWizard()

		expect(screen.getByRole('button', { name: /create duplicate/i })).toBeDisabled()
		expect(mutate).not.toHaveBeenCalled()
	})

	it('shows the "Name is required" error only after the field has been touched, not immediately on open', async () => {
		mockWizardData()
		useDuplicateMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)

		const user = await openWizard()

		expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument()

		const nameInput = screen.getByLabelText(/service name/i)
		await user.click(nameInput)
		await user.tab()

		expect(screen.getByText(/name is required/i)).toBeInTheDocument()
	})

	it('disables the confirm button while a duplication is already in flight', async () => {
		mockWizardData()
		useDuplicateMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: true } as never)

		await openWizard()

		expect(screen.getByRole('button', { name: /create duplicate/i })).toBeDisabled()
	})

	it('does not show a location picker when the source has 0 or 1 locations', async () => {
		mockWizardData({ locations: [{ id: 'oloc_1', name: 'Downtown' }] })
		useDuplicateMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)

		await openWizard()

		expect(screen.queryByText(/link the duplicate to/i)).not.toBeInTheDocument()
	})

	it('shows a location picker, defaulted to all checked, when the source has more than 1 location', async () => {
		mockWizardData({ locations: TWO_LOCATIONS })
		useDuplicateMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)

		await openWizard()

		expect(screen.getByText(/link the duplicate to/i)).toBeInTheDocument()
		expect(screen.getByRole('checkbox', { name: 'Downtown' })).toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Uptown' })).toBeChecked()
	})

	it('"Uncheck all" next to "What to copy" clears all 5 category checkboxes without touching locations', async () => {
		mockWizardData({ locations: TWO_LOCATIONS })
		useDuplicateMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)

		const user = await openWizard()
		const uncheckAllLinks = screen.getAllByRole('button', { name: 'Uncheck all' })
		await user.click(uncheckAllLinks[0] as HTMLElement)

		expect(screen.getByRole('checkbox', { name: 'Attributes' })).not.toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Hours' })).not.toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Contact info' })).not.toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Coverage area' })).not.toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Service tags' })).not.toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Downtown' })).toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Uptown' })).toBeChecked()
	})

	it('"Uncheck all" next to "Link the duplicate to" clears the location picker without touching categories', async () => {
		mockWizardData({ locations: TWO_LOCATIONS })
		useDuplicateMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)

		const user = await openWizard()
		const uncheckAllLinks = screen.getAllByRole('button', { name: 'Uncheck all' })
		await user.click(uncheckAllLinks[1] as HTMLElement)

		expect(screen.getByRole('checkbox', { name: 'Downtown' })).not.toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Uptown' })).not.toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Attributes' })).toBeChecked()
	})

	it('confirms with the typed name, no description, chosen categories, and unchecked-off locations', async () => {
		mockWizardData({ locations: TWO_LOCATIONS })
		const mutate = vi.fn()
		useDuplicateMutationMock.mockReturnValue({ mutate, isPending: false } as never)

		const user = await openWizard()
		await user.type(screen.getByLabelText(/service name/i), 'Legal Aid Clinic (North)')
		await user.click(screen.getByRole('checkbox', { name: 'Hours' }))
		await user.click(screen.getByRole('checkbox', { name: 'Uptown' }))
		await user.click(screen.getByRole('button', { name: /create duplicate/i }))

		expect(mutate).toHaveBeenCalledWith({
			sourceServiceId: SOURCE_SERVICE_ID,
			name: 'Legal Aid Clinic (North)',
			description: undefined,
			copyOptions: {
				attributes: true,
				hours: false,
				contactInfo: true,
				coverageArea: true,
				serviceTags: true,
			},
			locationIds: ['oloc_1'],
		})
	})

	it('the description field starts blank (never pre-filled from the source) and is sent only if typed', async () => {
		mockWizardData()
		const mutate = vi.fn()
		useDuplicateMutationMock.mockReturnValue({ mutate, isPending: false } as never)

		const user = await openWizard()

		expect(screen.getByLabelText(/description/i)).toHaveValue('')

		await user.type(screen.getByLabelText(/service name/i), 'Legal Aid Clinic (North)')
		await user.type(screen.getByLabelText(/description/i), 'Serves the north side clinic hours only')
		await user.click(screen.getByRole('button', { name: /create duplicate/i }))

		expect(mutate).toHaveBeenCalledWith(
			expect.objectContaining({ description: 'Serves the north side clinic hours only' })
		)
	})
})
