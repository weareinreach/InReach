import { t } from './initTRPC'
import { isAdmin, isStaff, isAuthed, hasPermissions } from './middleware'

export const defineRouter = t.router

/** Unprotected procedure */
export const publicProcedure = t.procedure

/** Protected procedure */
export const protectedProcedure = t.procedure.use(isAuthed)

/** Admin procedure */
export const adminProcedure = t.procedure.use(isAdmin)

/** Staff procedure */
export const staffProcedure = t.procedure.use(isStaff)

/** Permissioned router */
export const permissionedProcedure = t.procedure.use(hasPermissions)
