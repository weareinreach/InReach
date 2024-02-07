import { type GetServerSidePropsContext, type NextApiRequest, type NextApiResponse } from 'next'
import { getServerSession as nextauthServerSession } from 'next-auth'

import { authOptions } from './auth-options'
import { checkPermissions, type CheckPermissionsParams } from './session.browser'

interface SSRContext {
	req: GetServerSidePropsContext['req']
	res: GetServerSidePropsContext['res']
}
interface ApiContext {
	req: NextApiRequest
	res: NextApiResponse
}
type ServerContext = SSRContext | ApiContext

export const getServerSession = async (ctx: ServerContext) => {
	return nextauthServerSession(ctx.req, ctx.res, authOptions)
}

interface CheckServerPermissions extends Omit<CheckPermissionsParams, 'session'> {
	ctx: ServerContext
	returnNullSession?: boolean
}

export const checkServerPermissions = async ({
	ctx,
	permissions,
	has = 'all',
	returnNullSession,
}: CheckServerPermissions) => {
	const session = await getServerSession(ctx)
	const hasPerms = checkPermissions({ session, permissions, has })

	return hasPerms ? session : returnNullSession && session === null ? session : hasPerms
}
