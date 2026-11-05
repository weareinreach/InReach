/** Index 0 is the most powerful. Shared by every handler that needs to compare two users' relative rank. */
export const DATA_PORTAL_ROLE_NAMES = ['root', 'dataPortalAdmin', 'dataPortalManager', 'dataPortalBasic']

/** A role not in the hierarchy (including "no Data Portal role at all") ranks below every real one. */
export const getRoleIndex = (role: string) => {
	const idx = DATA_PORTAL_ROLE_NAMES.indexOf(role)
	return idx === -1 ? 999 : idx
}

/** The best (lowest-index/most-powerful) rank among a set of permission names. */
export const getBestRoleIndex = (permissionNames: readonly string[]) =>
	permissionNames.length ? Math.min(...permissionNames.map(getRoleIndex)) : getRoleIndex('')
