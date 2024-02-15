import { action } from '@storybook/addon-actions'
import prettyBytes from 'pretty-bytes'
import { type Promisable } from 'type-fest'

import { type ApiInput, type ApiOutput } from '@weareinreach/api'
import { getHTTPStatusCodeFromError, TRPC_ERROR_CODES_BY_KEY } from '@weareinreach/api/errorTypes'
import { type SuperJSONResult, transformer } from '@weareinreach/util/transformer'

const byteSize = (str: string) => Buffer.from(str).byteLength
export type RpcResponse<Data> = RpcSuccessResponse<Data> | RpcErrorResponse
export type RpcSuccessResponse<Data> = {
	result: {
		data: Data | SuperJSONResult
	}
}
type ErrorObject = {
	message: string
	code: number
	data: {
		code: string
		httpStatus: number
		stack: string
		path: string //TQuery
	}
}
export type RpcErrorResponse = {
	error: ErrorObject | SuperJSONResult
}

// According to JSON-RPC 2.0 and tRPC documentation.
// https://trpc.io/docs/rpc
export const jsonRpcSuccessResponse = <
	K1 extends keyof ApiInput,
	K2 extends keyof ApiInput[K1],
	T extends ApiOutput[K1][K2] | ((input: ApiInput[K1][K2]) => Promisable<ApiOutput[K1][K2]>),
>(
	path: [K1, K2],
	data: T
): RpcSuccessResponse<T> => {
	const transformedData = transformer.serialize(data)
	const recordAction = action(
		`✅ tRPC Response [${path.join('.')}] (${prettyBytes(byteSize(transformer.stringify(data)))})`
	)
	recordAction(data)
	return {
		result: {
			data: transformedData,
		},
	}
}

export type ErrorInput = {
	code: keyof typeof TRPC_ERROR_CODES_BY_KEY
	message: string
}

export const jsonRpcErrorResponse = <K1 extends keyof ApiInput, K2 extends keyof ApiInput[K1]>(
	path: [K1, K2],
	error: ErrorInput
): RpcErrorResponse => {
	const recordAction = action(`❌ tRPC Response [${path.join('.')}]`)
	const { message, code } = error
	const httpStatus = getHTTPStatusCodeFromError({ code, message, name: code })

	const errorData = {
		message,
		code: TRPC_ERROR_CODES_BY_KEY[code],
		data: {
			code,
			httpStatus,
			stack: 'Stacktrace',
			path: path.join('.'),
		},
	}

	recordAction(errorData)

	return {
		error: transformer.serialize(errorData),
	}
}
