export type RpcResponse<Data> = RpcSuccessResponse<Data> | RpcErrorResponse

export type RpcSuccessResponse<Data> = {
	// id: null
	result: {
		data: {
			json: Data
		}
	}
}

export type RpcErrorResponse = {
	// id: null
	error: {
		json: {
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
}

// According to JSON-RPC 2.0 and tRPC documentation.
// https://trpc.io/docs/rpc
export const jsonRpcSuccessResponse = (data: unknown) => ({
	// id: null,
	result: {
		data: {
			json: data,
		},
	},
})
