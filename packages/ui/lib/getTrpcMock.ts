import { action } from '@storybook/addon-actions'
import { type DefaultBodyType, delay, http, type HttpHandler, HttpResponse, type StrictRequest } from 'msw'

import path from 'path'
import querystring from 'querystring'

import { type ApiInput, type ApiOutput } from '@weareinreach/api'
import { getHTTPStatusCodeFromError } from '@weareinreach/api/errorTypes'
import { transformer } from '@weareinreach/util/transformer'

import { getBaseUrl } from './trpcClient'
import { type ErrorInput, jsonRpcErrorResponse, jsonRpcSuccessResponse } from './trpcResponse'

const getReqData = async (req: StrictRequest<DefaultBodyType>) => {
	if (req.method === 'POST') {
		const body = await req.clone().text()
		return body
	}
	const url = new URL(req.url)
	// const query = req.url.search.charAt(0) === '?' ? req.url.search.substring(1) : req.url.search
	const parsed = querystring.parse(url.searchParams.toString())
	if (parsed.input) {
		if (Array.isArray(parsed.input)) return parsed.input[0] ?? ''
		return parsed.input
	}
	return JSON.stringify(parsed)
}

/**
 * Mocks a TRPC endpoint and returns a msw handler for Storybook. Only supports routes with two levels. The
 * path and response is fully typed and infers the type from your routes file.
 *
 * @example Page.parameters = { msw: { handlers: [ getTRPCMock({ path: ["post", "getMany"], type: "query",
 * response: [ { id: 0, title: "test" }, { id: 1, title: "test" }, ], }), ], }, };
 *
 * @param endpoint.path - Path to the endpoint ex. ["post", "create"]
 * @param endpoint.response - Response to return ex. {id: 1}
 * @param endpoint.type - Specific type of the endpoint ex. "query" or "mutation" (defaults to "query")
 * @returns - Msw endpoint
 * @todo Make it accept multiple endpoints
 */
export const getTRPCMock = <
	K1 extends keyof ApiInput, // object itself
	K2 extends keyof ApiInput[K1], // all its keys
	O extends ApiOutput[K1][K2] | ((input: ApiInput[K1][K2]) => ApiOutput[K1][K2]),
>(
	endpoint: TRPCEndpointSuccess<K1, K2, O> | TRPCEndpointError<K1, K2>
): HttpHandler => {
	// #region msw handler
	const fn = endpoint.type === 'mutation' ? http.post : http.get

	const type = endpoint.type === 'mutation' ? 'mutation' : 'query'
	const trpcRequest = action(`${type === 'query' ? '❓' : '✍️'} tRPC Request [${endpoint.path.join('.')}]`)

	const route = path.join(getBaseUrl(), '/trpc/', endpoint.path[0] + '.' + (endpoint.path[1] as string))

	if (typeof endpoint.response === 'function') {
		const { response } = endpoint
		return fn(route, async (ctx) => {
			const data = await getReqData(ctx.request)

			const transformed = transformer.parse<ApiInput[K1][K2]>(data)
			trpcRequest(transformed)
			await delay(endpoint.delay)
			const responseData = jsonRpcSuccessResponse(endpoint.path, response(transformed))
			return HttpResponse.json(responseData, { status: 200 })
		})
	}

	if (endpoint.error) {
		return fn(route, async (ctx) => {
			const data = await getReqData(ctx.request)
			const transformed = transformer.parse<ApiInput[K1][K2]>(data)
			trpcRequest(transformed)
			await delay(endpoint.delay)
			const responseData = jsonRpcErrorResponse(endpoint.path, endpoint.error)
			const httpStatus = getHTTPStatusCodeFromError({
				code: endpoint.error.code,
				message: endpoint.error.message,
				name: endpoint.error.code,
			})
			return HttpResponse.json(responseData, { status: httpStatus })
		})
	}

	return fn(route, async (ctx) => {
		const data = await getReqData(ctx.request)
		const transformed = transformer.parse<ApiInput[K1][K2]>(data)
		trpcRequest(transformed)
		await delay(endpoint.delay)
		const responseData = jsonRpcSuccessResponse(endpoint.path, endpoint.response)
		return HttpResponse.json(responseData, { status: 200 })
	})
	// #endregion
}
type TRPCEndpointSuccess<
	K1 extends keyof ApiInput,
	K2 extends keyof ApiInput[K1],
	O extends ApiOutput[K1][K2] | ((input: ApiInput[K1][K2]) => ApiOutput[K1][K2]),
> = {
	path: [K1, K2]
	response: O
	error?: never
	type?: 'query' | 'mutation'
	delay?: number
}
type TRPCEndpointError<K1 extends keyof ApiInput, K2 extends keyof ApiInput[K1]> = {
	path: [K1, K2]
	response?: never
	error: ErrorInput
	type?: 'query' | 'mutation'
	delay?: number
}

export type MockDataObject<P extends keyof ApiOutput> = {
	[K in keyof ApiOutput[P]]?: ApiOutput[P][K] | ((input: ApiInput[P][K]) => ApiOutput[P][K])
}
export type MockHandlerObject<P extends keyof ApiOutput> = {
	[K in keyof ApiOutput[P]]?: HttpHandler
}
