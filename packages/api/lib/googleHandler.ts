import { TRPCError } from '@trpc/server'

import { type GoogleAPIResponse } from '~api/schemas/thirdParty/googleGeo'

/**
 * Google API error statuses mapped to tRPC error codes. `REQUEST_DENIED` means Google rejected our API key
 * (missing, invalid or restricted) - a server configuration problem, not something the visitor can fix, so
 * it's a server error rather than "unauthorized".
 */
const googleErrorCodes: Record<string, TRPCError['code']> = {
	INVALID_REQUEST: 'BAD_REQUEST',
	REQUEST_DENIED: 'INTERNAL_SERVER_ERROR',
	OVER_QUERY_LIMIT: 'TOO_MANY_REQUESTS',
	OVER_DAILY_LIMIT: 'TOO_MANY_REQUESTS',
	NOT_FOUND: 'NOT_FOUND',
	UNKNOWN_ERROR: 'INTERNAL_SERVER_ERROR',
}

const googleStatusError = (status: string, errorMessage: string | undefined, cause: unknown) =>
	new TRPCError({
		code: googleErrorCodes[status] ?? 'INTERNAL_SERVER_ERROR',
		message: errorMessage ?? `Google API request failed with status ${status}`,
		cause,
	})

export const googleAPIResponseHandler = <P extends GoogleAPIResponse, D>(parsedData: P, rawData: D) => {
	if (parsedData.status === 'OK' || parsedData.status === 'ZERO_RESULTS') {
		return parsedData
	}
	throw googleStatusError(parsedData.status, parsedData.error_message, rawData)
}

/** The response body a failed Google request carries, if the error is one - `{ status, error_message }`. */
const googleErrorBody = (error: unknown) => {
	const body = (error as { response?: { data?: unknown } } | null)?.response?.data
	if (
		typeof body === 'object' &&
		body !== null &&
		typeof (body as { status?: unknown }).status === 'string'
	) {
		return body as { status: string; error_message?: string }
	}
	return undefined
}

/**
 * Runs a Google Maps client request and returns its response body.
 *
 * The client's own HTTP adapter turns every non-OK Google status (other than ZERO_RESULTS) into an HTTP
 * 4xx/5xx and rejects with an AxiosError, so an error status never comes back as data -
 * `googleAPIResponseHandler`'s error branches never ran, and a quota or key problem reached visitors as a
 * generic 500 (#2075). This maps that rejection to the matching typed TRPCError. Anything else (e.g. a
 * network failure) is rethrown as-is.
 */
export const googleRequest = async <D>(request: () => Promise<{ data: D }>): Promise<D> => {
	try {
		const { data } = await request()
		return data
	} catch (error) {
		const body = googleErrorBody(error)
		if (body) {
			throw googleStatusError(body.status, body.error_message, error)
		}
		throw error
	}
}
