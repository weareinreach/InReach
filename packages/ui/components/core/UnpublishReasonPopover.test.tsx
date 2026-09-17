import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OrgUnpublishedReason } from '@weareinreach/db/enums'
import { render, screen } from '~ui/test/test-utils'

import { UnpublishReasonPopover } from './UnpublishReasonPopover'

// The test wrapper doesn't mount Mantine's `<Notifications />` container, so a real `showNotification`
// call never renders anything to assert on in the DOM - assert the call itself instead.
vi.mock('@mantine/notifications', () => ({ showNotification: vi.fn() }))

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		component: {
			EditModeBarPublish: { useMutation: vi.fn() },
		},
	},
}))

const { showNotification } = await import('@mantine/notifications')
const { trpc } = await import('~ui/lib/trpcClient')
const useUpdateStatusMock = vi.mocked(trpc.component.EditModeBarPublish.useMutation)

const pickReason = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.click(screen.getByRole('button', { name: 'Unpublish' }))
	// Popover.Dropdown renders into a portal, populated after a tick (floating-ui positioning) -
	// unlike the Select's own dropdown, which stays in-tree via `comboboxProps={{ withinPortal: false }}`.
	await user.click(await screen.findByPlaceholderText('Choose a reason'))
	// The option elements don't land in the DOM until floating-ui's position effect actually runs a
	// real macrotask - `findByRole`'s own polling loop never observes that update on its own (seen
	// hanging the full length of an explicit 5s timeout), only a real tick from outside it does.
	await new Promise((resolve) => setTimeout(resolve, 50))
	await user.click(screen.getByRole('option', { name: 'New', hidden: true }))
}

describe('UnpublishReasonPopover', () => {
	// `showNotification` is a single module-level spy shared across every test in this file - without
	// clearing it, the previous test's call count leaks into the next test's assertions.
	beforeEach(() => vi.clearAllMocks())

	it('keeps the popover open and shows a failure notification when the save errors, instead of closing as if it had succeeded', async () => {
		const user = userEvent.setup()
		const onSuccess = vi.fn()
		// Mirrors how `mutate` behaves for real: the mutation's own configured `onError` (not a
		// per-call callback) is what fires on failure.
		useUpdateStatusMock.mockImplementation((opts) => {
			const onError = opts?.onError as (() => void) | undefined
			const mutation = {
				mutate: () => onError?.(),
				isPending: false,
			}
			return mutation as never
		})

		render(
			<UnpublishReasonPopover slug='org_1' currentReason={null} onSuccess={onSuccess}>
				<button type='button'>Unpublish</button>
			</UnpublishReasonPopover>
		)

		await pickReason(user)
		// The whole popover dropdown (not just the Select's own inline options) stays `display: none`
		// in jsdom until floating-ui resolves its position - same `hidden: true` reasoning as above.
		await user.click(screen.getByRole('button', { name: 'Done', hidden: true }))

		expect(screen.getByRole('button', { name: 'Unpublish' })).toHaveAttribute('aria-expanded', 'true')
		expect(showNotification).toHaveBeenCalledWith(expect.objectContaining({ message: expect.anything() }))
		expect(onSuccess).not.toHaveBeenCalled()
	})

	it('only closes the popover and reports success once the save actually succeeds', async () => {
		const user = userEvent.setup()
		const onSuccess = vi.fn()
		useUpdateStatusMock.mockImplementation((opts) => {
			const onSuccess = opts?.onSuccess as (() => void) | undefined
			const mutation = {
				mutate: () => onSuccess?.(),
				isPending: false,
			}
			return mutation as never
		})

		render(
			<UnpublishReasonPopover slug='org_1' currentReason={null} onSuccess={onSuccess}>
				<button type='button'>Unpublish</button>
			</UnpublishReasonPopover>
		)

		await pickReason(user)
		// The whole popover dropdown (not just the Select's own inline options) stays `display: none`
		// in jsdom until floating-ui resolves its position - same `hidden: true` reasoning as above.
		await user.click(screen.getByRole('button', { name: 'Done', hidden: true }))

		expect(screen.getByRole('button', { name: 'Unpublish' })).toHaveAttribute('aria-expanded', 'false')
		expect(onSuccess).toHaveBeenCalledTimes(1)
		expect(showNotification).not.toHaveBeenCalled()
	})

	it('Done is disabled until a reason is picked', async () => {
		const user = userEvent.setup()
		useUpdateStatusMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)

		render(
			<UnpublishReasonPopover slug='org_1' currentReason={null}>
				<button type='button'>Unpublish</button>
			</UnpublishReasonPopover>
		)

		await user.click(screen.getByRole('button', { name: 'Unpublish' }))
		// Same jsdom/floating-ui quirk as `pickReason` below - the dropdown content needs a real tick
		// before `getByRole` (even with `hidden: true`) can see it.
		await new Promise((resolve) => setTimeout(resolve, 50))
		expect(screen.getByRole('button', { name: 'Done', hidden: true })).toBeDisabled()
	})

	it('pre-populates the Select from `currentReason` (the Set-status re-triage case)', async () => {
		const user = userEvent.setup()
		useUpdateStatusMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)

		render(
			<UnpublishReasonPopover slug='org_1' currentReason={OrgUnpublishedReason.INACTIVE}>
				<button type='button'>Unpublish</button>
			</UnpublishReasonPopover>
		)

		await user.click(screen.getByRole('button', { name: 'Unpublish' }))
		expect(await screen.findByPlaceholderText('Choose a reason')).toHaveValue('Inactive')
		// Already has a reason - Done shouldn't need a fresh selection to be enabled.
		expect(screen.getByRole('button', { name: 'Done', hidden: true })).toBeEnabled()
	})

	it('sends the trimmed note text together with the picked reason, only once Done is clicked', async () => {
		const user = userEvent.setup()
		const mutate = vi.fn()
		useUpdateStatusMock.mockReturnValue({ mutate, isPending: false } as never)

		render(
			<UnpublishReasonPopover slug='org_1' currentReason={null}>
				<button type='button'>Unpublish</button>
			</UnpublishReasonPopover>
		)

		await pickReason(user)
		expect(mutate).not.toHaveBeenCalled()

		await user.type(screen.getByLabelText('Note (optional)'), '  followed up by email  ')
		await user.click(screen.getByRole('button', { name: 'Done', hidden: true }))

		expect(mutate).toHaveBeenCalledTimes(1)
		expect(mutate).toHaveBeenCalledWith({
			slug: 'org_1',
			published: false,
			unpublishedReason: 'NEW',
			note: 'followed up by email',
		})
	})

	it('picking a reason only updates local state - it does not fire the mutation until Done is clicked', async () => {
		const user = userEvent.setup()
		const mutate = vi.fn()
		useUpdateStatusMock.mockReturnValue({ mutate, isPending: false } as never)

		render(
			<UnpublishReasonPopover slug='org_1' currentReason={null}>
				<button type='button'>Unpublish</button>
			</UnpublishReasonPopover>
		)

		await user.click(screen.getByRole('button', { name: 'Unpublish' }))
		await user.click(await screen.findByPlaceholderText('Choose a reason'))
		await new Promise((resolve) => setTimeout(resolve, 50))
		await user.click(screen.getByRole('option', { name: 'New', hidden: true }))
		expect(mutate).not.toHaveBeenCalled()

		// Changing the pick again before saving must not fire it either - regression test for the
		// original bug, where every `Select` change fired the mutation immediately.
		await user.click(screen.getByPlaceholderText('Choose a reason'))
		await new Promise((resolve) => setTimeout(resolve, 50))
		await user.click(screen.getByRole('option', { name: 'Inactive', hidden: true }))
		expect(mutate).not.toHaveBeenCalled()

		await user.click(screen.getByRole('button', { name: 'Done', hidden: true }))
		expect(mutate).toHaveBeenCalledTimes(1)
		expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ unpublishedReason: 'INACTIVE' }))
	})
})
