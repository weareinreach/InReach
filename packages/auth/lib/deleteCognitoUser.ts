import { getEnv } from '@weareinreach/env'

import { cognito } from './cognitoClient'

/**
 * A real, permanent delete (`AdminDeleteUser`) - not `adminDisableUser` (used by `deleteAccount.ts` for a
 * user's own self-service account deletion, which only disables the login). This exists specifically as a
 * compensating rollback for `mutation.create.handler.ts`'s signup flow: if the Cognito side of a signup
 * succeeds but the database write afterward fails, the Cognito user has to be fully removed again, not just
 * disabled, so the same email can be used to try signing up again.
 */
export const deleteCognitoUser = async (email: string) => {
	await cognito.adminDeleteUser({
		UserPoolId: getEnv('COGNITO_USER_POOL_ID'),
		Username: email.toLowerCase(),
	})
}
