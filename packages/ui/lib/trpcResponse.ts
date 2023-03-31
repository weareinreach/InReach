import { action } from '@storybook/addon-actions'
import { ApiInput } from '@weareinreach/api'
import { TRPC_ERROR_CODES_BY_KEY, getHTTPStatusCodeFromError } from '@weareinreach/api/errorTypes'
import { transformer, type SuperJSONResult } from '@weareinreach/api/lib/transformer'

export type RpcResponse<Data> = RpcSuccessResponse<Data> | RpcErrorResponse

export type RpcSuccessResponse<Data> = {
	result: {
		data: Data | SuperJSONResult
	}
}

export type RpcErrorResponse = {
	error: {
		message: string
		code: number
		data: {
			code: string
			httpStatus: number
			stack: string
			path: string //TQuery
		}
	}
}

// According to JSON-RPC 2.0 and tRPC documentation.
// https://trpc.io/docs/rpc
export const jsonRpcSuccessResponse = <K1 extends keyof ApiInput, K2 extends keyof ApiInput[K1], T = unknown>(
	path: [K1, K2],
	data: T
): RpcSuccessResponse<T> => {
	const recordAction = action(`tRPC Response [${path.join('.')}] (success)`)
	recordAction(data)
	return {
		result: {
			data: transformer.serialize(data),
		},
	}
}

type ErrorInput<K1 extends keyof ApiInput, K2 extends keyof ApiInput[K1]> = {
	code: keyof typeof TRPC_ERROR_CODES_BY_KEY
	path: [K1, K2]
	message: string
}

export const jsonRpcErrorResponse = <K1 extends keyof ApiInput, K2 extends keyof ApiInput[K1]>(
	error: ErrorInput<K1, K2>
): RpcErrorResponse => {
	const recordAction = action(`tRPC Response [${error.path.join('.')}] (failure/error)`)
	recordAction(error)
	const { message, code, path } = error

	const httpStatus = getHTTPStatusCodeFromError({ code, message, name: code })

	return {
		error: {
			message,
			code: TRPC_ERROR_CODES_BY_KEY[code],
			data: {
				code,
				httpStatus,
				stack: 'Stacktrace',
				path: path.join('.'),
			},
		},
	}
}
