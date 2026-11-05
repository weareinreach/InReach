import { TRPCError } from '@trpc/server'

import { type TRPCHandlerParams } from '~api/types/handler'

import { type TRevalidatePageSchema } from './mutation.revalidatePage.schema'

/**
 * Throws on failure instead of swallowing it into a `{revalidated: false}` result - every call site treated
 * this as fire-and-forget (`mutate(...)`, result discarded), so a failure here was completely silent: the
 * editor who just saved had no idea the public page might still show stale content, and nothing was reported
 * anywhere. Throwing means Sentry's tRPC middleware (`packages/api/lib/middleware/sentry.ts`, applied to
 * every procedure) picks this up automatically, and `useRevalidatePage` (packages/ui/hooks) surfaces it to
 * the editor as a notification.
 */
const revalidatePage = async ({ ctx, input }: TRPCHandlerParams<TRevalidatePageSchema, 'protected'>) => {
	if (!ctx.res) {
		throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Response object is not available' })
	}
	try {
		await ctx.res.revalidate(input.path)
	} catch (error) {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: `Failed to revalidate ${input.path}`,
			cause: error,
		})
	}
	return { revalidated: true }
}
export default revalidatePage
