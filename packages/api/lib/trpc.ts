import { t } from './initTRPC'
import { hasPermissions, isAdmin, isAuthed, isStaff, sentryMiddleware } from './middleware'
import { getPermissions, type PermissionedProcedure } from './permissions'

export const defineRouter = t.router
export const mergeRouters = t.mergeRouters

const baseProcedure = t.procedure.use(sentryMiddleware)

/** Unprotected procedure */
export const publicProcedure = baseProcedure

/** Protected procedure */
export const protectedProcedure = baseProcedure.use(isAuthed)

/** Admin procedure */
export const adminProcedure = baseProcedure.use(isAdmin)

/** Staff procedure */
export const staffProcedure = baseProcedure.use(isStaff)

/** Permissioned router */
export const permissionedProcedure = (procedure: PermissionedProcedure) =>
	baseProcedure.use(hasPermissions).meta(getPermissions(procedure))
