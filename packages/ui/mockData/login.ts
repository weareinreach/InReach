import { action } from '@storybook/addon-actions'
import { rest } from 'msw'

const providerResponse = {
	cognito: {
		id: 'cognito',
		name: 'Cognito',
		type: 'credentials',
		signinUrl: 'http://localhost:6006/api/auth/signin/cognito',
		callbackUrl: 'http://localhost:6006/api/auth/callback/cognito',
	},
}

export const providers = () =>
	rest.get('/api/auth/providers', (req, res, ctx) => res(ctx.delay(), ctx.json(providerResponse)))

export const csrf = () =>
	rest.get('/api/auth/csrf', (req, res, ctx) =>
		res(
			ctx.delay(),
			ctx.json({ csrfToken: 'd11134f8413295d97df65b0dfdb7166db4bb1e49af48345a4d567a841ffd048b' })
		)
	)

export const signin = () =>
	rest.all('/api/auth/signin', (req, res, ctx) => {
		return res(ctx.delay(), ctx.json({ ...req.params }))
	})

export const cognito = () =>
	rest.post('/api/auth/callback/cognito', async (req, res, ctx) => {
		const data = new URLSearchParams(await req.text())
		const password = data.get('password')

		if (password === 'good') {
			action('Login with good credentials')()
			return res(
				ctx.delay(),
				ctx.json({
					url: 'http://localhost:6006/?path=/story/modals-login--modal',
				})
			)
		}
		action('Login with bad credentials')()
		return res(
			ctx.delay(),
			ctx.status(401),
			ctx.json({
				url: 'http://localhost:6006/api/auth/error?error=Incorrect%20username%20or%20password.',
			})
		)
	})
