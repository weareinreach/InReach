import { trpc as api } from '~ui/lib/trpcClient'

import { useNewNotification } from './useNewNotification'

/**
 * Wraps `api.misc.revalidatePage` with a visible failure path - previously every call site fired this
 * mutation and discarded the result, so a failed refresh (the handler's own `ctx.res.revalidate()` throwing,
 * or the request itself failing) was completely silent: the editor who just saved had no indication the
 * public page might still show the old content, and nothing was reported anywhere. The handler now throws on
 * failure instead of swallowing it (so Sentry's tRPC middleware picks it up automatically, same as any other
 * procedure error) - this surfaces that failure to the editor as a warning notification.
 */
export const useRevalidatePage = () => {
	const notifyFailure = useNewNotification({
		icon: 'warning',
		displayText: "Saved, but the public page couldn't be refreshed yet - it may show the old info for a bit.",
	})
	const { mutate } = api.misc.revalidatePage.useMutation({ onError: notifyFailure })
	return mutate
}
