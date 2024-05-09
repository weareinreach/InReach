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

/** Handler Cache */

// eslint-disable-next-line @typescript-eslint/ban-types
const HANDLER_CACHE: Record<string, Function> = {}

/**
 * This function will import the module defined in importer just once and then cache the default export of
 * that module.
 *
 * It gives you the default export of the module.
 *
 * **Note: It is your job to ensure that the name provided is unique across all routes.**
 *
 * @example
 *
 * ```ts
 * const handler = await importHandler('myUniqueNameSpace', () => import('./getUser.handler'))
 * return handler({ ctx, input })
 * ```
 */
export const importHandler = async <
	T extends {
		// eslint-disable-next-line @typescript-eslint/ban-types
		default: Function
	},
>(
	/**
	 * The name of the handler in cache. It has to be unique across all routes
	 */
	name: string,
	importer: () => Promise<T>
) => {
	const nameInCache = name satisfies keyof typeof HANDLER_CACHE

	if (!HANDLER_CACHE[nameInCache]) {
		const importedModule = await importer()
		HANDLER_CACHE[nameInCache] = importedModule.default
		return importedModule.default as T['default']
	}

	return HANDLER_CACHE[nameInCache] as unknown as T['default']
}
