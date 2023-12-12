import { action } from '@storybook/addon-actions'
import { delay, http, HttpResponse, type PathParams } from 'msw'

import querystring from 'querystring'

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
	http.get('/api/auth/providers', async () => {
		await delay()
		return HttpResponse.json(providerResponse)
	})

export const csrf = () =>
	http.get('/api/auth/csrf', async () => {
		await delay()
		return HttpResponse.json({
			csrfToken: 'd11134f8413295d97df65b0dfdb7166db4bb1e49af48345a4d567a841ffd048b',
		})
	})

export const signin = () =>
	http.all('/api/auth/signin', async (ctx) => {
		await delay()
		return HttpResponse.json({ ...ctx.params })
	})

export const cognito = () =>
	http.post<PathParams, SignInResponse>('/api/auth/callback/cognito', async (ctx) => {
		const body = await ctx.request.text()
		const data = querystring.parse(body)
		const { password } = data

		await delay()

		if (password === 'good') {
			const returnData = {
				url: 'http://localhost:6006/?path=/story/modals-login--modal',
				status: 200,
				ok: true,
				error: undefined,
			}
			action('Login with good credentials')(returnData)
			return HttpResponse.json(returnData)
		}
		const returnData = {
			error: 'Incorrect username or password.',
			ok: false,
			status: 401,
			url: null,
		}
		action('Login with bad credentials')(returnData)
		return HttpResponse.json(returnData, { status: 401 })
	})

interface SignInResponse {
	error: string | undefined
	status: number
	ok: boolean
	url: string | null
}
