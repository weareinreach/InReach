import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		user: {
			adminResetPassword: { useMutation: vi.fn() },
			adminSetTemporaryPassword: { useMutation: vi.fn() },
			adminResendCode: { useMutation: vi.fn() },
			adminConfirmUser: { useMutation: vi.fn() },
		},
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const { render, screen } = await import('~ui/test/test-utils')
const { PasswordResetAction, SetTemporaryPasswordAction, ResendVerificationAction, ForceVerificationAction } =
	await import('./UserTable')

const adminResetPasswordMock = vi.mocked(trpc.user.adminResetPassword.useMutation)
const adminSetTemporaryPasswordMock = vi.mocked(trpc.user.adminSetTemporaryPassword.useMutation)
const adminResendCodeMock = vi.mocked(trpc.user.adminResendCode.useMutation)
const adminConfirmUserMock = vi.mocked(trpc.user.adminConfirmUser.useMutation)

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

describe('SetTemporaryPasswordAction', () => {
	const mutate = vi.fn()
	const reset = vi.fn()

	beforeEach(() => {
		mutate.mockClear()
		reset.mockClear()
		adminSetTemporaryPasswordMock.mockReturnValue({
			mutate,
			isPending: false,
			data: undefined,
			reset,
		} as never)
	})

	it('does not call the mutation until the confirm dialog is accepted', async () => {
		render(<SetTemporaryPasswordAction email={EMAIL} />)
		await userEvent.setup().click(screen.getByRole('button'))

		expect(await screen.findByText(/sure you want to set a temporary password/i)).toBeInTheDocument()
		expect(mutate).not.toHaveBeenCalled()
	})

	it('calls adminSetTemporaryPassword with exactly the target email once confirmed (no extra fields)', async () => {
		render(<SetTemporaryPasswordAction email={EMAIL} />)
		const user = userEvent.setup()
		await user.click(screen.getByRole('button'))
		await user.click(await screen.findByRole('button', { name: 'Yes' }))

		expect(mutate).toHaveBeenCalledTimes(1)
		expect(mutate).toHaveBeenCalledWith({ email: EMAIL })
	})

	it('does not call the mutation when the confirm dialog is dismissed', async () => {
		render(<SetTemporaryPasswordAction email={EMAIL} />)
		const user = userEvent.setup()
		await user.click(screen.getByRole('button'))
		await user.click(await screen.findByRole('button', { name: 'No' }))

		expect(mutate).not.toHaveBeenCalled()
	})

	// The modal deliberately doesn't close on success (unlike the other three actions) - staff need to
	// read/copy the generated password before it's gone, so it's shown in place of the confirm prompt.
	it('shows the generated password (not the confirm prompt) once the mutation has succeeded', async () => {
		adminSetTemporaryPasswordMock.mockReturnValue({
			mutate,
			isPending: false,
			data: { temporaryPassword: 'Ab3%cdEfGh' },
			reset,
		} as never)
		render(<SetTemporaryPasswordAction email={EMAIL} />)
		await userEvent.setup().click(screen.getByRole('button'))

		expect(await screen.findByText('Ab3%cdEfGh')).toBeInTheDocument()
		expect(screen.queryByText(/sure you want to set a temporary password/i)).not.toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
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

describe('ForceVerificationAction', () => {
	const mutate = vi.fn()

	beforeEach(() => {
		mutate.mockClear()
		adminConfirmUserMock.mockReturnValue({ mutate, isPending: false } as never)
	})

	it('does not call the mutation until the confirm dialog is accepted', async () => {
		render(<ForceVerificationAction email={EMAIL} />)
		await userEvent.setup().click(screen.getByRole('button'))

		expect(await screen.findByText(/sure you want to confirm/i)).toBeInTheDocument()
		expect(mutate).not.toHaveBeenCalled()
	})

	it('calls adminConfirmUser with exactly the target email once confirmed (no extra fields)', async () => {
		render(<ForceVerificationAction email={EMAIL} />)
		const user = userEvent.setup()
		await user.click(screen.getByRole('button'))
		await user.click(await screen.findByRole('button', { name: 'Yes' }))

		expect(mutate).toHaveBeenCalledTimes(1)
		expect(mutate).toHaveBeenCalledWith({ email: EMAIL })
	})

	it('does not call the mutation when the confirm dialog is dismissed', async () => {
		render(<ForceVerificationAction email={EMAIL} />)
		const user = userEvent.setup()
		await user.click(screen.getByRole('button'))
		await user.click(await screen.findByRole('button', { name: 'No' }))

		expect(mutate).not.toHaveBeenCalled()
	})
})
