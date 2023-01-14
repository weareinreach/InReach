import { type inferAsyncReturnType } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { type Session, getServerSession } from '@weareinreach/auth'
import { prisma } from '@weareinreach/db'

type CreateContextOptions = {
	session: Session | null
}

/**
 * Use this helper for:
 *
 * - Testing, so we dont have to mock Next.js' req/res
 * - Trpc's `createSSGHelpers` where we don't have req/res
 *
 * @see https://beta.create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
// eslint-disable-next-line @typescript-eslint/require-await
export const createContextInner = async (opts: CreateContextOptions) => {
	return {
		session: opts.session,
		prisma,
	}
}

/**
 * This is the actual context you'll use in your router
 *
 * @link https://trpc.io/docs/context
 */
export const createContext = async (opts: CreateNextContextOptions) => {
	const { req, res } = opts

	// Get the session from the server using the unstable_getServerSession wrapper function
	const session = await getServerSession({ req, res })

	return await createContextInner({
		session,
	})
}

export type Context = inferAsyncReturnType<typeof createContext>
