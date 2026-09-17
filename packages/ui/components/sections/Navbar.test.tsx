import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen } from '~ui/test/test-utils'

import { Navbar } from './Navbar'

// The test wrapper doesn't mount Mantine's `<Notifications />` container, so a real `showNotification`
// call never renders anything to assert on in the DOM - assert the call itself instead.
vi.mock('@mantine/notifications', () => ({ showNotification: vi.fn() }))

// Neither is under test here, and both pull in next-auth/next-dynamic-loaded modals that aren't worth
// wiring up just to render a nav bar that isn't what these tests assert on.
vi.mock('~ui/components/core/UserMenu', () => ({ UserMenu: () => null }))
vi.mock('~ui/components/core/MobileNav', () => ({ MobileNav: () => null }))

vi.mock('~ui/hooks/useEditMode', () => ({ useEditMode: vi.fn() }))

const mockRouter = {
	pathname: '/org/[slug]/edit',
	query: { slug: 'test-org' },
	asPath: '/org/test-org/edit',
	isFallback: false,
	replace: vi.fn(),
}
vi.mock('next/router', () => ({ useRouter: () => mockRouter }))

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		useUtils: vi.fn(),
		misc: { revalidatePage: { useMutation: vi.fn() } },
		component: {
			EditModeBar: { useQuery: vi.fn() },
			EditModeBarReverify: { useMutation: vi.fn() },
			EditModeBarPublish: { useMutation: vi.fn() },
			EditModeBarDelete: { useMutation: vi.fn() },
		},
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const { useEditMode } = await import('~ui/hooks/useEditMode')

const useEditModeMock = vi.mocked(useEditMode)
const useEditModeBarQueryMock = vi.mocked(trpc.component.EditModeBar.useQuery)
const useReverifyMock = vi.mocked(trpc.component.EditModeBarReverify.useMutation)
const usePublishMock = vi.mocked(trpc.component.EditModeBarPublish.useMutation)
const useDeleteMock = vi.mocked(trpc.component.EditModeBarDelete.useMutation)
const useRevalidateMock = vi.mocked(trpc.misc.revalidatePage.useMutation)
const useUtilsMock = vi.mocked(trpc.useUtils)

type FakeRecord = { published: boolean; unpublishedReason: string | null; deleted: boolean }

/**
 * `EditModeBarPublish` is called from two places sharing the same mocked hook - Navbar's own "Publish" toggle
 * and `UnpublishReasonPopover`'s "Done" button (for both Unpublish and Set-status). Routing every call
 * through one fake record, the way the real handler would persist it, is what lets a whole
 * Publish/Unpublish/Set-status cycle be driven through actual button clicks instead of asserting each
 * mutation call in isolation.
 */
const wireFakeBackend = (record: FakeRecord) => {
	useEditModeBarQueryMock.mockImplementation(() => {
		const result = { data: record }
		return result as never
	})
	usePublishMock.mockImplementation((opts) => {
		const onSuccess = opts?.onSuccess as (() => void) | undefined
		const mutation = {
			mutate: (input: { published: boolean; unpublishedReason?: string | null }) => {
				record.published = input.published
				// Mirrors the real handler: publishing always clears any prior unpublished reason.
				record.unpublishedReason = input.published ? null : (input.unpublishedReason ?? null)
				onSuccess?.()
			},
			isPending: false,
		}
		return mutation as never
	})
}

const setup = (initial: FakeRecord) => {
	const record = { ...initial }
	useEditModeMock.mockReturnValue({
		isEditMode: true,
		unsaved: { state: false },
		saveEvent: { save: vi.fn() },
	} as never)
	useUtilsMock.mockReturnValue({
		location: { invalidate: vi.fn() },
		organization: { invalidate: vi.fn() },
		component: { EditModeBar: { invalidate: vi.fn() } },
	} as never)
	useRevalidateMock.mockReturnValue({ mutate: vi.fn() } as never)
	useReverifyMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
	useDeleteMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
	wireFakeBackend(record)
	const rendered = render(<Navbar />)
	return { record, ...rendered }
}

// Same jsdom/floating-ui quirk as UnpublishReasonPopover.test.tsx: the option elements don't land in the
// DOM until a real macrotask runs, which `findByRole`'s own polling never observes on its own.
const chooseReasonAndSave = async (
	user: ReturnType<typeof userEvent.setup>,
	triggerName: string,
	reasonLabel: string
) => {
	await user.click(screen.getByRole('button', { name: triggerName }))
	await user.click(await screen.findByPlaceholderText('Choose a reason'))
	await new Promise((resolve) => setTimeout(resolve, 50))
	await user.click(screen.getByRole('option', { name: reasonLabel, hidden: true }))
	await user.click(screen.getByRole('button', { name: 'Done', hidden: true }))
}

describe('EditModeBar (Navbar in edit mode)', () => {
	beforeEach(() => vi.clearAllMocks())

	it('shows only "Unpublish" while published', () => {
		setup({ published: true, unpublishedReason: null, deleted: false })

		expect(screen.getByRole('button', { name: 'Unpublish' })).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'Set status' })).not.toBeInTheDocument()
	})

	it('shows "Publish" and "Set status" together once unpublished', () => {
		setup({ published: false, unpublishedReason: 'NEW', deleted: false })

		expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Set status' })).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'Unpublish' })).not.toBeInTheDocument()
	})

	it('"Publish" is a plain instant toggle - no reason/note dialog appears', async () => {
		const user = userEvent.setup()
		const { record, rerender } = setup({ published: false, unpublishedReason: 'NEW', deleted: false })

		await user.click(screen.getByRole('button', { name: 'Publish' }))

		expect(record.published).toBe(true)
		expect(screen.queryByPlaceholderText('Choose a reason')).not.toBeInTheDocument()
		rerender(<Navbar />)
		expect(screen.getByRole('button', { name: 'Unpublish' })).toBeInTheDocument()
	})

	it('"Set status" changes the reason without republishing', async () => {
		const user = userEvent.setup()
		const { record, rerender } = setup({ published: false, unpublishedReason: 'NEW', deleted: false })

		await chooseReasonAndSave(user, 'Set status', 'Inactive')

		expect(record.published).toBe(false)
		expect(record.unpublishedReason).toBe('INACTIVE')
		rerender(<Navbar />)
		// Still unpublished - "Set status"/"Publish" stay, "Unpublish" doesn't appear.
		expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Set status' })).toBeInTheDocument()
	})

	it('Publish -> Unpublish(reason) -> Set status(another reason) -> Publish, all reactively, no refresh', async () => {
		const user = userEvent.setup()
		const { record, rerender } = setup({ published: false, unpublishedReason: 'NEW', deleted: false })

		await user.click(screen.getByRole('button', { name: 'Publish' }))
		expect(record.published).toBe(true)
		rerender(<Navbar />)
		expect(screen.getByRole('button', { name: 'Unpublish' })).toBeInTheDocument()

		await chooseReasonAndSave(user, 'Unpublish', 'Inactive')
		expect(record).toMatchObject({ published: false, unpublishedReason: 'INACTIVE' })
		rerender(<Navbar />)
		expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Set status' })).toBeInTheDocument()

		await chooseReasonAndSave(user, 'Set status', 'Unresponsive')
		expect(record).toMatchObject({ published: false, unpublishedReason: 'UNRESPONSIVE' })
		rerender(<Navbar />)
		// Still unpublished after Set status - it must never republish as a side effect.
		expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: 'Publish' }))
		expect(record).toMatchObject({ published: true, unpublishedReason: null })
		rerender(<Navbar />)
		expect(screen.getByRole('button', { name: 'Unpublish' })).toBeInTheDocument()
	})

	it('Unpublish -> Publish -> Unpublish again does not leak the first reason into the second popover', async () => {
		const user = userEvent.setup()
		const { record, rerender } = setup({ published: true, unpublishedReason: null, deleted: false })

		await chooseReasonAndSave(user, 'Unpublish', 'Waiting to hear back')
		expect(record).toMatchObject({ published: false, unpublishedReason: 'WAITING' })
		rerender(<Navbar />)

		await user.click(screen.getByRole('button', { name: 'Publish' }))
		// Publishing clears the reason server-side - a stale reason left behind would misleadingly
		// carry over if the org is unpublished again before anyone sets a fresh one.
		expect(record).toMatchObject({ published: true, unpublishedReason: null })
		rerender(<Navbar />)

		await user.click(screen.getByRole('button', { name: 'Unpublish' }))
		const reasonSelect = await screen.findByPlaceholderText('Choose a reason')
		// This is a fresh mount of `UnpublishReasonPopover` (the ternary swapped branches twice), not the
		// same instance reused - its local `reason` state must come from the now-null `currentReason`
		// prop, not whatever was left over from the first Unpublish earlier in this same test.
		expect(reasonSelect).toHaveValue('')
	})
})
