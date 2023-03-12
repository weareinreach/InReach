import { type inferAsyncReturnType } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { type Session, getServerSession } from '@weareinreach/auth'
import { prisma, generateId } from '@weareinreach/db'

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

export const createContextInner = async (opts: CreateContextOptions) => {
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

	return await createContextInner({
		session,
	})
}

export type Context = inferAsyncReturnType<typeof createContext>
