import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		user: {
			adminResetPassword: { useMutation: vi.fn() },
			adminResendCode: { useMutation: vi.fn() },
		},
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const { render, screen } = await import('~ui/test/test-utils')
const { PasswordResetAction, ResendVerificationAction } = await import('./UserTable')

const adminResetPasswordMock = vi.mocked(trpc.user.adminResetPassword.useMutation)
const adminResendCodeMock = vi.mocked(trpc.user.adminResendCode.useMutation)

const EMAIL = 'staff-target@example.com'

/**
 * Covers the two staff-only Data Portal actions added for #<self-service verification/reset> - each is a
 * small, self-contained icon -> confirm -> mutate component, tested in isolation rather than through the full
 * UserTable (which needs its own data-fetching/permission mocking this doesn't need to exercise). Both are
 * exported from UserTable.tsx specifically to make this possible.
 */
describe('PasswordResetAction', () => {
	const mutate = vi.fn()

	beforeEach(() => {
		mutate.mockClear()
		adminResetPasswordMock.mockReturnValue({ mutate, isPending: false } as never)
	})

	// The icon trigger itself has no accessible name (Mantine's Tooltip doesn't add an aria-label to
	// its child) - it's the only button on screen before the confirm dialog opens, so `getByRole`
	// with no name filter is the reliable way to reach it. "Yes"/"No" inside the dialog have real
	// text content and are queried by name as usual.
	it('does not call the mutation until the confirm dialog is accepted', async () => {
		render(<PasswordResetAction email={EMAIL} />)
		await userEvent.setup().click(screen.getByRole('button'))

		expect(await screen.findByText(/sure you want to reset/i)).toBeInTheDocument()
		expect(mutate).not.toHaveBeenCalled()
	})

	it('calls adminResetPassword with the target email once confirmed', async () => {
		render(<PasswordResetAction email={EMAIL} />)
		const user = userEvent.setup()
		await user.click(screen.getByRole('button'))
		await user.click(await screen.findByRole('button', { name: 'Yes' }))

		expect(mutate).toHaveBeenCalledTimes(1)
		expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ email: EMAIL }))
	})

	it('does not call the mutation when the confirm dialog is dismissed', async () => {
		render(<PasswordResetAction email={EMAIL} />)
		const user = userEvent.setup()
		await user.click(screen.getByRole('button'))
		await user.click(await screen.findByRole('button', { name: 'No' }))

		expect(mutate).not.toHaveBeenCalled()
	})
})

describe('ResendVerificationAction', () => {
	const mutate = vi.fn()

	beforeEach(() => {
		mutate.mockClear()
		adminResendCodeMock.mockReturnValue({ mutate, isPending: false } as never)
	})

	it('does not call the mutation until the confirm dialog is accepted', async () => {
		render(<ResendVerificationAction email={EMAIL} />)
		await userEvent.setup().click(screen.getByRole('button'))

		expect(await screen.findByText(/sure you want to resend/i)).toBeInTheDocument()
		expect(mutate).not.toHaveBeenCalled()
	})

	it('calls adminResendCode with exactly the target email once confirmed (no extra fields)', async () => {
		render(<ResendVerificationAction email={EMAIL} />)
		const user = userEvent.setup()
		await user.click(screen.getByRole('button'))
		await user.click(await screen.findByRole('button', { name: 'Yes' }))

		expect(mutate).toHaveBeenCalledTimes(1)
		expect(mutate).toHaveBeenCalledWith({ email: EMAIL })
	})

	it('does not call the mutation when the confirm dialog is dismissed', async () => {
		render(<ResendVerificationAction email={EMAIL} />)
		const user = userEvent.setup()
		await user.click(screen.getByRole('button'))
		await user.click(await screen.findByRole('button', { name: 'No' }))

		expect(mutate).not.toHaveBeenCalled()
	})
})
