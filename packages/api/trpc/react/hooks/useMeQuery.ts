import { trpc } from '../trpc'

export function useMeQuery() {
	const meQuery = trpc.auth.getSession.useQuery(undefined, {
		retry(failureCount) {
			return failureCount > 3
		},
	})

	return meQuery
}

export default useMeQuery
