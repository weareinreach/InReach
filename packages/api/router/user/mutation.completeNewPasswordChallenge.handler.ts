import { TRPCError } from '@trpc/server'

import {
	completeNewPasswordChallenge as completeChallenge,
	InvalidTemporaryPasswordError,
	UnexpectedChallengeError,
} from '@weareinreach/auth/completeNewPasswordChallenge'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCompleteNewPasswordChallengeSchema } from './mutation.completeNewPasswordChallenge.schema'

/**
 * Public (the user isn't logged in yet at this point) - completes the NEW_PASSWORD_REQUIRED challenge a
 * staff-set temporary password produces. Requires knowing the temporary password itself, so (unlike
 * resendCode/forgotPassword) this doesn't need the enumeration-safe always-succeed treatment: an anonymous
 * caller can't do anything with this endpoint without already having that secret.
 */
const completeNewPasswordChallenge = async ({
	input,
}: TRPCHandlerParams<TCompleteNewPasswordChallengeSchema>) => {
	try {
		return await completeChallenge(input.email, input.temporaryPassword, input.newPassword)
	} catch (error) {
		if (error instanceof InvalidTemporaryPasswordError) {
			throw new TRPCError({ code: 'BAD_REQUEST', message: error.message, cause: error })
		}
		if (error instanceof UnexpectedChallengeError) {
			throw new TRPCError({ code: 'BAD_REQUEST', message: error.message, cause: error })
		}
		throw error
	}
}
export default completeNewPasswordChallenge
