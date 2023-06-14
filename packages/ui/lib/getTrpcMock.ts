/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { action } from '@storybook/addon-actions'
import { rest, type RestHandler, type RestRequest } from 'msw'

import path from 'path'
import querystring from 'querystring'

import { type ApiInput, type ApiOutput } from '@weareinreach/api'
import { transformer } from '@weareinreach/api/lib/transformer'

import { getBaseUrl } from './trpcClient'
import { type ErrorInput, jsonRpcErrorResponse, jsonRpcSuccessResponse } from './trpcResponse'

const getReqData = async (req: RestRequest) => {
	if (req.method === 'POST') {
		const body = await req.clone().text()
		return body
	}
	const query = req.url.search.charAt(0) === '?' ? req.url.search.substr(1) : req.url.search
	const parsed = querystring.parse(query)
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
	O extends ApiOutput[K1][K2] | ((input: ApiInput[K1][K2]) => ApiOutput[K1][K2])
>(
	endpoint: TRPCEndpointSuccess<K1, K2, O> | TRPCEndpointError<K1, K2>
): RestHandler => {
	// #region msw handler
	const fn = endpoint.type === 'mutation' ? rest.post : rest.get

	const type = endpoint.type === 'mutation' ? 'mutation' : 'query'
	const trpcRequest = action(`${type === 'query' ? '❓' : '✍️'} tRPC Request [${endpoint.path.join('.')}]`)

	const route = path.join(getBaseUrl(), '/trpc/', endpoint.path[0] + '.' + (endpoint.path[1] as string))

	if (typeof endpoint.response === 'function') {
		const { response } = endpoint
		return fn(route, async (req, res, ctx) => {
			const data = await getReqData(req)
			const transformed = transformer.parse<ApiInput[K1][K2]>(data)
			trpcRequest(transformed)
			return res(
				ctx.json(jsonRpcSuccessResponse(endpoint.path, response(transformed))),
				ctx.delay(endpoint.delay)
			)
		})
	}

	return fn(route, async (req, res, ctx) => {
		const data = await getReqData(req)
		const transformed = transformer.parse<ApiInput[K1][K2]>(data)
		trpcRequest(transformed)
		if (endpoint.error) {
			return res(ctx.json(jsonRpcErrorResponse(endpoint.path, endpoint.error)), ctx.delay(endpoint.delay))
		}

		return res(ctx.json(jsonRpcSuccessResponse(endpoint.path, endpoint.response)), ctx.delay(endpoint.delay))
	})
	// #endregion
}
type TRPCEndpointSuccess<
	K1 extends keyof ApiInput,
	K2 extends keyof ApiInput[K1],
	O extends ApiOutput[K1][K2] | ((input: ApiInput[K1][K2]) => ApiOutput[K1][K2])
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
