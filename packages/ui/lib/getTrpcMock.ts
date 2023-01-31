/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { ApiInput, ApiOutput } from '@weareinreach/api'
import { rest } from 'msw'

import path from 'path'

import { getBaseUrl } from './trpcClient'
import { jsonRpcSuccessResponse } from './trpcResponse'

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
	K1 extends keyof ApiInput,
	K2 extends keyof ApiInput[K1], // object itself
	O extends ApiOutput[K1][K2] // all its keys
>(endpoint: {
	path: [K1, K2]
	response: O
	type?: 'query' | 'mutation'
}) => {
	const fn = endpoint.type === 'mutation' ? rest.post : rest.get

	const route = path.join(getBaseUrl(), '/trpc/', endpoint.path[0] + '.' + (endpoint.path[1] as string))

	console.log(route)

	return fn(route, (req, res, ctx) => {
		return res(ctx.json(jsonRpcSuccessResponse(endpoint.response)))
	})
}
