import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen, waitFor, within } from '~ui/test/test-utils'

const notifyError = vi.fn()
vi.mock('~ui/hooks/useNewNotification', () => ({ useNewNotification: () => notifyError }))

const mutate = vi.fn()
const invalidateEditDrawer = vi.fn()
const invalidateModal = vi.fn()
vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		useUtils: () => ({
			service: {
				forServiceEditDrawer: { invalidate: invalidateEditDrawer },
				forServiceModal: { invalidate: invalidateModal },
			},
		}),
		component: { AttributeEditWrapper: { useMutation: vi.fn(() => ({ mutate })) } },
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const { AttributeEditWrapper } = await import('./AttributeEditWrapper')

const useMutationMock = vi.mocked(trpc.component.AttributeEditWrapper.useMutation)
const mutationOptions = () =>
	useMutationMock.mock.calls.at(-1)?.[0] as { onSuccess: () => unknown; onError: () => unknown }

// A service's "Get help" phone/email/link rows are access instructions stored as attribute supplements - their
// id here is always the supplement's (see modals/Service/processors). #2102 assumed real OrgPhone/OrgEmail/
// OrgWebsite ids reached this action; no screen sends one.
const SUPPLEMENT_ID = 'atts_01H00000000000000000000000'

beforeEach(() => {
	vi.clearAllMocks()
})

describe('AttributeEditWrapper', () => {
	it('toggling an active row sends its supplement id with toggleActive', async () => {
		render(
			<AttributeEditWrapper id={SUPPLEMENT_ID} active>
				(555) 555-0100
			</AttributeEditWrapper>
		)

		await userEvent.click(screen.getByRole('button', { name: 'Deactivate' }))

		expect(mutate).toHaveBeenCalledWith({ id: SUPPLEMENT_ID, action: 'toggleActive' })
	})

	it('an inactive row offers Activate instead', () => {
		render(
			<AttributeEditWrapper id={SUPPLEMENT_ID} active={false}>
				(555) 555-0100
			</AttributeEditWrapper>
		)

		expect(screen.getByRole('button', { name: 'Activate' })).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'Deactivate' })).not.toBeInTheDocument()
	})

	it('delete asks for confirmation first, then sends the supplement id with delete', async () => {
		render(
			<AttributeEditWrapper id={SUPPLEMENT_ID} active>
				(555) 555-0100
			</AttributeEditWrapper>
		)

		await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
		expect(mutate).not.toHaveBeenCalled()

		const dialog = await screen.findByRole('dialog', { name: 'Delete Attribute' })
		await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))

		expect(mutate).toHaveBeenCalledWith({ id: SUPPLEMENT_ID, action: 'delete' })
	})

	it('after a successful change, refreshes both the service edit drawer and the service modal', async () => {
		render(
			<AttributeEditWrapper id={SUPPLEMENT_ID} active>
				(555) 555-0100
			</AttributeEditWrapper>
		)

		await mutationOptions().onSuccess()

		expect(invalidateEditDrawer).toHaveBeenCalled()
		// The service modal shows the same rows - it used to keep the old state until a reload.
		expect(invalidateModal).toHaveBeenCalled()
	})

	it('shows an error when the change fails, instead of failing silently', async () => {
		render(
			<AttributeEditWrapper id={SUPPLEMENT_ID} active>
				(555) 555-0100
			</AttributeEditWrapper>
		)

		mutationOptions().onError()

		await waitFor(() => expect(notifyError).toHaveBeenCalledTimes(1))
	})
})
