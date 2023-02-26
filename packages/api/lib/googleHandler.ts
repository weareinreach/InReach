import { TRPCError } from '@trpc/server'

import { type GoogleAPIResponse } from '~api/schemas/thirdParty/googleGeo'

export const googleAPIResponseHandler = <P extends GoogleAPIResponse, D>(parsedData: P, rawData: D) => {
	switch (parsedData.status) {
		case 'OK': {
			return parsedData
		}
		case 'ZERO_RESULTS': {
			return parsedData
		}
		case 'INVALID_REQUEST': {
			throw new TRPCError({ code: 'BAD_REQUEST', cause: rawData })
		}
		case 'REQUEST_DENIED': {
			throw new TRPCError({ code: 'UNAUTHORIZED', cause: rawData })
		}
		case 'OVER_QUERY_LIMIT': {
			throw new TRPCError({ code: 'TOO_MANY_REQUESTS', cause: rawData })
		}
		case 'UNKNOWN_ERROR': {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: parsedData.error_message,
				cause: rawData,
			})
		}
	}
}
