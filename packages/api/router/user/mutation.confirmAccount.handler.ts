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
		throw error
	}
}
export default confirmAccount
