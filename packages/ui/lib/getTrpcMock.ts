/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { ApiInput, ApiOutput } from '@weareinreach/api'
import { transformer } from '@weareinreach/api/lib/transformer'
import { RestRequest, rest } from 'msw'

import path from 'path'
import querystring from 'querystring'

import { getBaseUrl } from './trpcClient'
import { jsonRpcSuccessResponse } from './trpcResponse'

const getReqData = async (req: RestRequest) => {
	if (req.method === 'POST') {
		const body = await req.text()
		const data = querystring.parse(body)
		return JSON.stringify(data)
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
>(endpoint: {
	path: [K1, K2]
	response: O
	type?: 'query' | 'mutation'
}) => {
	const fn = endpoint.type === 'mutation' ? rest.post : rest.get

	const route = path.join(getBaseUrl(), '/trpc/', endpoint.path[0] + '.' + (endpoint.path[1] as string))

	if (typeof endpoint.response === 'function') {
		const { response } = endpoint
		return fn(route, async (req, res, ctx) => {
			const data = await getReqData(req)
			const transformed = transformer.parse<ApiInput[K1][K2]>(data)
			return res(ctx.delay(), ctx.json(jsonRpcSuccessResponse(response(transformed))))
		})
	}

	return fn(route, (req, res, ctx) => {
		return res(ctx.delay(), ctx.json(jsonRpcSuccessResponse(endpoint.response)))
	})
}
