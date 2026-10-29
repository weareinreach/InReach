import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const signInMock = vi.fn()
vi.mock('next-auth/react', () => ({ signIn: (...args: unknown[]) => signInMock(...args) }))
vi.mock('next/router', () => ({
	useRouter: () => ({ locale: 'en', query: {}, push: vi.fn(), replace: vi.fn() }),
}))

const resendCodeUseMutation = vi.fn()
const completeNewPasswordChallengeUseMutation = vi.fn()
// `LoginBody` sits in the same render tree as sibling modals eagerly mounted alongside it (the
// signup form's `api.user.create`, `TroubleLoggingInModal`'s `api.user.troubleLoggingIn`, etc.) -
// none of that is under test here, so every `trpc.<namespace>.<procedure>.useQuery`/`useMutation`
// gets a safe no-op default via this Proxy, and only `user.resendCode`/`user.completeNewPasswordChallenge`
// are overridden below with controllable mocks.
vi.mock('~ui/lib/trpcClient', () => {
	const noopResult = {
		mutate: vi.fn(),
		mutateAsync: vi.fn().mockResolvedValue(undefined),
		isPending: false,
		isSuccess: false,
		data: undefined,
		isLoading: false,
	}
	const leafHandler: ProxyHandler<object> = {
		get: (_t, prop) => (prop === 'useMutation' || prop === 'useQuery' ? () => noopResult : undefined),
	}
	const userHandler: ProxyHandler<object> = {
		get: (_t, prop) => {
			if (prop === 'resendCode') return { useMutation: resendCodeUseMutation }
			if (prop === 'completeNewPasswordChallenge') {
				return { useMutation: completeNewPasswordChallengeUseMutation }
			}
			return new Proxy({}, leafHandler)
		},
	}
	const trpcHandler: ProxyHandler<object> = {
		get: (_t, prop) => (prop === 'user' ? new Proxy({}, userHandler) : new Proxy({}, leafHandler)),
	}
	return { trpc: new Proxy({}, trpcHandler) }
})

const { render, screen, within } = await import('~ui/test/test-utils')
const { LoginBody } = await import('./index')

const resendCodeMock = resendCodeUseMutation
const resendCodeMutate = vi.fn()
const completeNewPasswordChallengeMock = completeNewPasswordChallengeUseMutation
const completeNewPasswordChallengeMutateAsync = vi.fn()

const EMAIL = 'someone@example.com'
const PASSWORD = 'correct-password'

const fillAndSubmit = async (container: HTMLElement) => {
	const user = userEvent.setup()
	const form = within(container)
	// Each field's <label> also contains a `*` required-marker span, so its text content is actually
	// "Email *"/"Password *" - an exact 'Email'/'Password' string matches nothing. Anchoring a regex at
	// the start avoids both that and the password field's "Toggle password visibility" button, whose
	// aria-label would otherwise collide with a loose, unanchored /password/i match.
	const emailInput = form.getByLabelText(/^Email/)
	const passwordInput = form.getByLabelText(/^Password/)
	await user.clear(emailInput)
	await user.type(emailInput, EMAIL)
	await user.clear(passwordInput)
	await user.type(passwordInput, PASSWORD)
	await user.click(form.getAllByRole('button', { name: 'Log in' })[0] as HTMLElement)
}

/**
 * Regression coverage for the login form's `UserNotConfirmed` handling (providers/cognito.ts's `authorize`
 * re-throws this specific Error so NextAuth passes it through as `signIn()`'s `result.error`). Before this,
 * every `authorize` failure - wrong password or an unconfirmed account - showed the identical generic
 * "incorrect username or password" message, giving someone with an unverified account no way to tell what was
 * actually wrong.
 */
describe('LoginBody - UserNotConfirmed handling', () => {
	beforeEach(() => {
		resendCodeMutate.mockClear()
		resendCodeMock.mockReturnValue({ mutate: resendCodeMutate, isPending: false, isSuccess: false } as never)
	})

	it('shows the account-not-verified message (not the generic one) and a resend button', async () => {
		signInMock.mockResolvedValueOnce({ error: 'UserNotConfirmed', status: 401, ok: false, url: null })
		const { container } = render(<LoginBody />)
		await fillAndSubmit(container)

		expect(await screen.findByText(/hasn't been verified yet/i)).toBeInTheDocument()
		expect(screen.queryByText('Incorrect username or password.')).not.toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Request a new code' })).toBeInTheDocument()
	})

	it('still shows the generic message for every other failure, with no resend button', async () => {
		signInMock.mockResolvedValueOnce({ error: 'CredentialsSignin', status: 401, ok: false, url: null })
		const { container } = render(<LoginBody />)
		await fillAndSubmit(container)

		expect(await screen.findByText('Incorrect username or password.')).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'Request a new code' })).not.toBeInTheDocument()
	})

	it('clicking "Request a new code" resends to the exact email that was just attempted', async () => {
		signInMock.mockResolvedValueOnce({ error: 'UserNotConfirmed', status: 401, ok: false, url: null })
		const { container } = render(<LoginBody />)
		await fillAndSubmit(container)

		await userEvent.setup().click(await screen.findByRole('button', { name: 'Request a new code' }))

		expect(resendCodeMutate).toHaveBeenCalledTimes(1)
		expect(resendCodeMutate).toHaveBeenCalledWith({ email: EMAIL })
	})

	it('shows a confirmation once the code has been resent', async () => {
		signInMock.mockResolvedValueOnce({ error: 'UserNotConfirmed', status: 401, ok: false, url: null })
		resendCodeMock.mockReturnValue({ mutate: resendCodeMutate, isPending: false, isSuccess: true } as never)
		const { container } = render(<LoginBody />)
		await fillAndSubmit(container)

		expect(await screen.findByText(/new verification email is on its way/i)).toBeInTheDocument()
	})

	it('clears the unconfirmed-account state on a fresh login attempt', async () => {
		signInMock.mockResolvedValueOnce({ error: 'UserNotConfirmed', status: 401, ok: false, url: null })
		const { container } = render(<LoginBody />)
		await fillAndSubmit(container)
		expect(await screen.findByRole('button', { name: 'Request a new code' })).toBeInTheDocument()

		signInMock.mockResolvedValueOnce({ ok: true, error: null, status: 200, url: null })
		await fillAndSubmit(container)

		expect(screen.queryByRole('button', { name: 'Request a new code' })).not.toBeInTheDocument()
	})
})

/**
 * Regression coverage for the "set temporary password" staff action (UserTable's
 * `SetTemporaryPasswordAction`, backed by Cognito's AdminSetUserPassword with Permanent: false). Logging in
 * with that temporary password doesn't succeed or fail - it comes back as a NEW_PASSWORD_REQUIRED challenge,
 * which the login form must surface as a "choose your new password" step rather than a generic error.
 */
describe('LoginBody - NewPasswordRequired handling', () => {
	beforeEach(() => {
		completeNewPasswordChallengeMutateAsync.mockClear()
		completeNewPasswordChallengeMock.mockReturnValue({
			mutateAsync: completeNewPasswordChallengeMutateAsync,
			isPending: false,
		} as never)
	})

	it('shows the set-new-password step instead of a generic error', async () => {
		signInMock.mockResolvedValueOnce({ error: 'NewPasswordRequired', status: 401, ok: false, url: null })
		const { container } = render(<LoginBody />)
		await fillAndSubmit(container)

		expect(await screen.findByText(/temporary password/i)).toBeInTheDocument()
		expect(screen.queryByText('Incorrect username or password.')).not.toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Set New Password' })).toBeInTheDocument()
	})

	it('completes the challenge with the email and original (temporary) password, then signs in with the new one', async () => {
		signInMock.mockResolvedValueOnce({ error: 'NewPasswordRequired', status: 401, ok: false, url: null })
		completeNewPasswordChallengeMutateAsync.mockResolvedValueOnce(undefined)
		signInMock.mockResolvedValueOnce({ ok: true, error: null, status: 200, url: null })
		const { container } = render(<LoginBody />)
		await fillAndSubmit(container)

		const user = userEvent.setup()
		const newPasswordInput = screen.getByLabelText(/^New Password/)
		await user.type(newPasswordInput, 'Br4nd-New-Password')
		await user.click(screen.getByRole('button', { name: 'Set New Password' }))

		expect(completeNewPasswordChallengeMutateAsync).toHaveBeenCalledWith({
			email: EMAIL,
			temporaryPassword: PASSWORD,
			newPassword: 'Br4nd-New-Password',
		})
		expect(signInMock).toHaveBeenLastCalledWith('cognito', {
			email: EMAIL,
			password: 'Br4nd-New-Password',
			redirect: false,
		})
	})

	it('shows an error and stays on the step if completing the challenge fails', async () => {
		signInMock.mockResolvedValueOnce({ error: 'NewPasswordRequired', status: 401, ok: false, url: null })
		completeNewPasswordChallengeMutateAsync.mockRejectedValueOnce(new Error('Temporary password expired'))
		const { container } = render(<LoginBody />)
		await fillAndSubmit(container)

		const user = userEvent.setup()
		await user.type(screen.getByLabelText(/^New Password/), 'Br4nd-New-Password')
		await user.click(screen.getByRole('button', { name: 'Set New Password' }))

		expect(await screen.findByText(/temporary password may have expired/i)).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Set New Password' })).toBeInTheDocument()
	})
})
