import { createServerSideHelpers } from '@trpc/react-query/server'
import { type GetServerSidePropsContext, type NextApiRequest, type NextApiResponse } from 'next'

import { getServerSession } from '@weareinreach/auth/next-auth/get-session'
import { type Session } from '@weareinreach/auth/next-auth/types'
import { createContextInner } from '~api/lib/context'
import { transformer } from '~api/lib/transformer'
import { appRouter } from '~api/router'

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
