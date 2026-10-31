import { TRPCError } from '@trpc/server'

import { adminSetTemporaryPassword } from '@weareinreach/auth/adminSetTemporaryPassword'
import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { DATA_PORTAL_ROLE_NAMES, getBestRoleIndex } from './lib/dataPortalRoleHierarchy'
import { type TAdminSetTemporaryPasswordSchema } from './mutation.adminSetTemporaryPassword.schema'

/**
 * Admin+ (gated in index.ts) - sets a one-time temporary password with no email involved, for when the normal
 * "send a reset link" path can't reach the user. Returns the generated password so staff can relay it
 * out-of-band; see `adminSetTemporaryPassword` for why that's safe (the user must still choose their own real
 * password on next login before they're actually authenticated).
 *
 * Being Admin+ alone isn't enough: without checking the TARGET's own rank, an Admin could set a temporary
 * password on another Admin's account, or (before this file required Admin+ at all) a Manager could do the
 * same to a Root account - a real account-takeover path, since a temporary password lets whoever receives it
 * sign in as that user. This only allows acting on a target whose rank is strictly below the actor's own.
 */
const adminSetTemporaryPasswordHandler = async ({
	ctx,
	input,
}: TRPCHandlerParams<TAdminSetTemporaryPasswordSchema, 'protected'>) => {
	try {
		const targetUser = await prisma.user.findUnique({
			where: { email: input.email },
			select: {
				permissions: { select: { permission: { select: { name: true } } } },
				roles: {
					select: {
						role: { select: { permissions: { select: { permission: { select: { name: true } } } } } },
					},
				},
			},
		})
		const targetPermissionNames = [
			...(targetUser?.permissions.map(({ permission }) => permission.name) ?? []),
			...(targetUser?.roles.flatMap(({ role }) =>
				role.permissions.map(({ permission }) => permission.name)
			) ?? []),
		].filter((name): name is string => DATA_PORTAL_ROLE_NAMES.includes(name))

		const isActorRoot = ctx.session.user.permissions.includes('root')
		const actorBestIndex = getBestRoleIndex(ctx.session.user.permissions)
		const targetBestIndex = getBestRoleIndex(targetPermissionNames)

		// Root can act on anyone, including another root account. Everyone else can only target someone
		// with strictly less access than their own (a numerically higher, i.e. weaker, rank index).
		if (!isActorRoot && targetBestIndex <= actorBestIndex) {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: 'You can only set a temporary password for an account with less access than your own.',
			})
		}

		return await adminSetTemporaryPassword(input.email)
	} catch (error) {
		return handleError(error)
	}
}
export default adminSetTemporaryPasswordHandler
