import { createCognitoUser } from '@weareinreach/auth/createUser'
import { deleteCognitoUser } from '@weareinreach/auth/deleteCognitoUser'
import { getAuditedClient } from '@weareinreach/db'
import { createLoggerInstance } from '@weareinreach/util/logger'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema } from './mutation.create.schema'

const log = createLoggerInstance('user.create')

/**
 * Public signup - deliberately never reveals whether `input.cognito.email` already has an account, the same
 * generic-response convention as `forgotPasswordSafe`/`resendVerificationCodeSafe` (see those for the sibling
 * pattern). A duplicate email used to throw a distinguishable "User already exists" CONFLICT, which was a
 * straightforward account-enumeration oracle; this silently no-ops instead.
 *
 * Cognito's `signUp` call happens first and the database write second, not the other way around - Cognito has
 * no rollback semantics of its own, so if it ran _after_ the database write and a later step failed, the
 * database would roll back while the Cognito user stayed created, orphaned with no matching row (#2104). With
 * Cognito first, a database failure can still be compensated by deleting the Cognito user it just created, so
 * the same email can retry signup instead of being permanently stuck.
 */
const create = async ({ input }: TRPCHandlerParams<TCreateSchema>): Promise<{ success: true }> => {
	const prisma = getAuditedClient(input.prisma.data.id)
	try {
		const existing = await prisma.user.findUnique({
			where: { email: input.cognito.email },
			select: { id: true },
		})
		if (!existing) {
			const cognitoUser = await createCognitoUser(input.cognito)
			if (!cognitoUser?.cognitoId) {
				throw new Error('Could not create Cognito user')
			}

			try {
				await prisma.$transaction(async (tx) => {
					const user = await tx.user.create(input.prisma)
					if (user.id !== input.cognito.databaseId) {
						throw new Error('Database ID mismatch')
					}
					if (cognitoUser.prismaAccount) {
						await tx.account.create(cognitoUser.prismaAccount)
					}
				})
			} catch (dbError) {
				await deleteCognitoUser(input.cognito.email).catch((cleanupError: unknown) => log.error(cleanupError))
				throw dbError
			}
		}
	} catch (error) {
		// Never surfaced to the caller - logged here so staff can still investigate a genuine failure.
		log.error(error)
	}
	return { success: true }
}
export default create
