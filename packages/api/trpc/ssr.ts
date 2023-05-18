import { createServerSideHelpers } from '@trpc/react-query/server'
import { type GetServerSidePropsContext, type NextApiRequest, type NextApiResponse } from 'next'

import { getServerSession, type Session } from '@weareinreach/auth'

import { createContextInner, transformer } from '../lib'
import { appRouter } from '../router'

interface SSRContext {
	req: GetServerSidePropsContext['req']
	res: GetServerSidePropsContext['res']
	session?: never
}
interface ApiContext {
	req: NextApiRequest
	res: NextApiResponse
	session?: never
}
interface SessionContext {
	req?: never
	res?: never
	session: Session | null
}
type ServerContext = SSRContext | ApiContext

const isSessionContext = (ctx: ServerContext | SessionContext): ctx is SessionContext =>
	ctx?.session !== undefined
export const trpcServerClient = async (ctx: ServerContext | SessionContext) => {
	const session = isSessionContext(ctx) ? ctx.session : await getServerSession(ctx)
	return createServerSideHelpers({
		router: appRouter,
		ctx: createContextInner({ session }),
		transformer,
	})
}
