import { TRPCError } from '@trpc/server'

import {
	CodeMismatchException,
	confirmAccount as cognitoConfirmAccount,
	ExpiredCodeException,
} from '@weareinreach/auth/confirmAccount'
import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TConfirmAccountSchema } from './mutation.confirmAccount.schema'

const confirmAccount = async ({ input }: TRPCHandlerParams<TConfirmAccountSchema>) => {
	try {
		const { code, email } = input
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
