import { type Session } from 'next-auth'

import { type Permission } from '@weareinreach/db/generated/permission'

export interface CheckPermissionsParams {
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
