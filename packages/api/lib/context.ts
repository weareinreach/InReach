import { type inferAsyncReturnType } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'

import { getServerSession, type Session } from '@weareinreach/auth'
import { generateId, prisma } from '@weareinreach/db'

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

export const createContextInner = (opts: CreateContextOptions) => {
	return {
		session: opts.session,
		prisma,
		generateId,
	}
}

/**
 * This is the actual context you'll use in your router
 *
 * @link https://trpc.io/docs/context
 */
export const createContext = async (opts?: CreateNextContextOptions) => {
	const { req, res } = opts ?? { req: undefined, res: undefined }

	// Get the session from the server using the unstable_getServerSession wrapper function
	const session = (req && res && (await getServerSession({ req, res }))) || null

	return createContextInner({
		session,
	})
}

export type Context = inferAsyncReturnType<typeof createContext>
