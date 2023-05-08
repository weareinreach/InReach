import { type GetServerSidePropsContext, type NextApiRequest, type NextApiResponse } from 'next'
import { getServerSession as nextauthServerSession, type Session } from 'next-auth'

import { type Permission } from '@weareinreach/db/generated/permission'

import { authOptions } from './auth-options'

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
interface CheckPermissionsParams {
	session: Session | null
	permissions: Permission | Permission[]
	has: 'all' | 'some'
}
export const checkPermissions = ({ session, permissions, has = 'all' }: CheckPermissionsParams) => {
	if (!session) return false
	if (session.user.permissions.includes('root')) return true
	const userPerms = new Set(session.user.permissions)
	const permsToCheck = Array.isArray(permissions) ? permissions : [permissions]
	return has === 'all'
		? permsToCheck.every((perm) => userPerms.has(perm))
		: permsToCheck.some((perm) => userPerms.has(perm))
}

interface CheckServerPermissions extends Omit<CheckPermissionsParams, 'session'> {
	ctx: ServerContext
}

export const checkServerPermissions = async ({ ctx, permissions, has = 'all' }: CheckServerPermissions) => {
	const session = await getServerSession(ctx)
	const hasPerms = checkPermissions({ session, permissions, has })

	return hasPerms ? session : hasPerms
}
