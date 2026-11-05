import { TRPCError } from '@trpc/server'

import {
	CodeMismatchException,
	confirmAccount as cognitoConfirmAccount,
	ExpiredCodeException,
} from '@weareinreach/auth/confirmAccount'
import { prisma } from '@weareinreach/db'
import { checkRateLimit } from '@weareinreach/util/rateLimit'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TConfirmAccountSchema } from './mutation.confirmAccount.schema'

const confirmAccount = async ({ input }: TRPCHandlerParams<TConfirmAccountSchema>) => {
	try {
		const { code, email } = input
		// Public, unauthenticated - a caller who knows an email can otherwise submit unlimited codes.
		const allowed = await checkRateLimit(`ratelimit:confirmAccount:${email.toLowerCase()}`, {
			max: 5,
			windowSeconds: 15 * 60,
		})
		if (!allowed) {
			throw new TRPCError({
				code: 'TOO_MANY_REQUESTS',
				message: 'Too many attempts. Please try again later.',
			})
		}
		const response = await cognitoConfirmAccount(email, code)

		const { id } = await prisma.user.findFirstOrThrow({
			where: {
				email: {
					equals: email.toLowerCase(),
					mode: 'insensitive',
				},
			},
			select: {
				id: true,
			},
		})

		await prisma.user.update({
			where: {
				id,
			},
			data: {
				emailVerified: new Date(),
			},
		})
		return response
	} catch (error) {
		if (error instanceof CodeMismatchException) {
			throw new TRPCError({ code: 'BAD_REQUEST', message: 'Code mismatch', cause: error })
		}
		if (error instanceof ExpiredCodeException) {
			throw new TRPCError({ code: 'BAD_REQUEST', message: 'Code expired', cause: error })
		}
		// Anything we deliberately threw ourselves (e.g. the rate limit above) keeps its own message.
		if (error instanceof TRPCError) {
			throw error
		}
		// Everything else - UserNotFoundException (no account), NotAuthorizedException (already confirmed),
		// etc. - previously re-thrown as-is, which passed Cognito's raw exception message straight through to
		// the client. That let an anonymous caller distinguish "no such account" from "already confirmed" from
		// "wrong code", the same account-enumeration pattern already fixed for signup. Collapse all of them
		// into one generic message - and deliberately no `cause` here (unlike the two branches above): the
		// login modal's AccountVerified.tsx reads `error.data.cause.name` to pick which message to show, so
		// attaching the real exception would let the frontend reconstruct the exact distinction this is
		// supposed to hide, regardless of what this top-level message says.
		throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid or expired code' })
	}
}
export default confirmAccount
