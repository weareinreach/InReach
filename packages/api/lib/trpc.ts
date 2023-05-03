import { t } from './initTRPC'
import { hasPermissions, isAdmin, isAuthed, isStaff } from './middleware'
import { getPermissions, type PermissionedProcedure } from './permissions'

export const defineRouter = t.router
export const mergeRouters = t.mergeRouters

/** Unprotected procedure */
export const publicProcedure = t.procedure

/** Protected procedure */
export const protectedProcedure = t.procedure.use(isAuthed)

/** Admin procedure */
export const adminProcedure = t.procedure.use(isAdmin)

/** Staff procedure */
export const staffProcedure = t.procedure.use(isStaff)

/** Permissioned router */
export const permissionedProcedure = (procedure: PermissionedProcedure) =>
	t.procedure.use(hasPermissions).meta(getPermissions(procedure))
