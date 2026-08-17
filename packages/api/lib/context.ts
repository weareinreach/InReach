import { type inferAsyncReturnType } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { type NextApiRequest, type NextApiResponse } from 'next'

import { getServerSession, type Session } from '@weareinreach/auth'
import { generateId } from '@weareinreach/db/lib/idGen'

export type CreateContextOptions = {
	session: Session | null
	req?: NextApiRequest
	res?: NextApiResponse
}

/**
 * `responseMeta` (used to set cache-control headers) only ever sees the context object returned by
 * `createContext`, not the merged context middleware produces via `next({ ctx })` — that merge only flows to
 * the downstream procedure resolver. `res` is the one reference shared across the whole request lifecycle, so
 * middleware that needs to opt a response out of caching must mark it here.
 */
export type ResponseWithSkipCache = NextApiResponse & { skipCache?: boolean }

export const markSkipCache = (res?: NextApiResponse) => {
	if (res) {
		const typedRes = res as ResponseWithSkipCache
		typedRes.skipCache = true
	}
}

export const getSkipCache = (res?: NextApiResponse) =>
	Boolean((res as ResponseWithSkipCache | undefined)?.skipCache)

/**
 * Use this helper for:
 *
 * - Testing, so we dont have to mock Next.js' req/res
 * - Trpc's `createSSGHelpers` where we don't have req/res
 *
 * @see https://beta.create.t3.gg/en/usage/trpc#-servertrpccontextts
 */

export const createContextInner = (opts: CreateContextOptions) => {
	const locale = opts.req?.cookies['NEXT_LOCALE'] ?? 'en'
	return {
		generateId,
		locale,
		session: opts.session,
		skipCache: false,
		req: opts.req,
		res: opts.res,
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

	return {
		...createContextInner({
			session,
			req,
			res,
		}),
	}
}

export type Context = inferAsyncReturnType<typeof createContext>
