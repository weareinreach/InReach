import { action } from '@storybook/addon-actions'
import { transformer } from '@weareinreach/api/lib/transformer'

export type RpcResponse<Data> = RpcSuccessResponse<Data> | RpcErrorResponse

export type RpcSuccessResponse<Data> = {
	// id: null
	result: {
		data: Data
	}
}

export type RpcErrorResponse = {
	// id: null
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
export const jsonRpcSuccessResponse = (data: unknown) => {
	const recordAction = action('tRPC')
	recordAction(data)
	return {
		// id: null,
		result: {
			data: transformer.serialize(data),
		},
	}
}
