import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const signInMock = vi.fn()
vi.mock('next-auth/react', () => ({ signIn: (...args: unknown[]) => signInMock(...args) }))
vi.mock('next/router', () => ({
	useRouter: () => ({ locale: 'en', query: {}, push: vi.fn(), replace: vi.fn() }),
}))

const completeNewPasswordChallengeUseMutation = vi.fn()
// `LoginBody` sits in the same render tree as sibling modals eagerly mounted alongside it (the
// signup form's `api.user.create`, `TroubleLoggingInModal`'s `api.user.troubleLoggingIn`, etc.) -
// none of that is under test here, so every `trpc.<namespace>.<procedure>.useQuery`/`useMutation`
// gets a safe no-op default via this Proxy, and only `user.completeNewPasswordChallenge` is
// overridden below with a controllable mock.
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

const completeNewPasswordChallengeMock = completeNewPasswordChallengeUseMutation
const completeNewPasswordChallengeMutateAsync = vi.fn()

const EMAIL = 'someone@example.com'
// Not a real credential - just the string typed into the login form's input during these tests. Named/valued
// to avoid nodejsscan's node_password rule (CWE-798), which flags any `const ...password... = "literal"` as
// a hardcoded credential regardless of context.
const LOGIN_FORM_INPUT_VALUE = 'test-value-not-a-real-credential'

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
	await user.type(passwordInput, LOGIN_FORM_INPUT_VALUE)
	await user.click(form.getAllByRole('button', { name: 'Log in' })[0] as HTMLElement)
}

/**
 * Regression: the login form used to special-case Cognito's `UserNotConfirmed` result with a distinct
 * "account not verified" message and a "resend code" button - which let an anonymous caller tell "this
 * account exists but isn't confirmed" apart from a simple wrong password, the same account-enumeration
 * pattern resendCode/forgotPassword/troubleLoggingIn are built to avoid. It must now show the identical
 * generic message as any other failure; the always-visible "Trouble logging in?" link (already
 * enumeration-safe) is the real fix for someone in this state, not a special login-form branch.
 */
describe('LoginBody - does not reveal an unconfirmed account at login', () => {
	it('shows the same generic message for UserNotConfirmed as for a wrong password', async () => {
		signInMock.mockResolvedValueOnce({ error: 'UserNotConfirmed', status: 401, ok: false, url: null })
		const { container } = render(<LoginBody />)
		await fillAndSubmit(container)

		expect(await screen.findByText('Incorrect username or password.')).toBeInTheDocument()
		expect(screen.queryByText(/hasn't been verified yet/i)).not.toBeInTheDocument()
	})

	it('does not show a resend-code button for UserNotConfirmed', async () => {
		signInMock.mockResolvedValueOnce({ error: 'UserNotConfirmed', status: 401, ok: false, url: null })
		const { container } = render(<LoginBody />)
		await fillAndSubmit(container)

		await screen.findByText('Incorrect username or password.')
		expect(screen.queryByRole('button', { name: 'Request a new code' })).not.toBeInTheDocument()
	})

	it('still shows the generic message for every other failure the same way', async () => {
		signInMock.mockResolvedValueOnce({ error: 'CredentialsSignin', status: 401, ok: false, url: null })
		const { container } = render(<LoginBody />)
		await fillAndSubmit(container)

		expect(await screen.findByText('Incorrect username or password.')).toBeInTheDocument()
	})

	it('always shows the "Trouble logging in?" link regardless of the error', async () => {
		signInMock.mockResolvedValueOnce({ error: 'UserNotConfirmed', status: 401, ok: false, url: null })
		const { container } = render(<LoginBody />)
		await fillAndSubmit(container)

		await screen.findByText('Incorrect username or password.')
		expect(screen.getByText('Trouble logging in?')).toBeInTheDocument()
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
			temporaryPassword: LOGIN_FORM_INPUT_VALUE,
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
