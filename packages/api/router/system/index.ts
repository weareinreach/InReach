import { adminProcedure, defineRouter } from '~api/lib/trpc'

import { permissionSubRouter } from './permission'
import { userRoleSubRouter } from './role'

export const systemRouter = defineRouter({
	permissions: permissionSubRouter,
	// userRoles: userRoleSubRouter,
})
