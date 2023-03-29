import { Prisma, prisma } from '@weareinreach/db'

import crypto from 'crypto'

import { logger } from './logger'

type VerifyUser = (email: string, password: string) => Promise<VerifyUserReturn>

type VerifyUserReturn = { valid: true; id: string } | { valid: false }

export const verifyUser: VerifyUser = async (email, password) => {
	try {
		const userProfile = await prisma.user.findUniqueOrThrow({
			where: {
				email: email,
			},
			select: {
				id: true,
				email: true,
				legacySalt: true,
				legacyHash: true,
			},
		})
		if (userProfile.legacySalt === null) {
			logger.error(`No legacySalt for ${email}`)
			throw new Error(`No legacySalt for ${email}`)
		}
		if (userProfile.legacyHash === null) {
			logger.error(`No legacyHash for ${email}`)
			throw new Error(`No legacyHash for ${email}`)
		}
		const hash = crypto.pbkdf2Sync(password, userProfile.legacySalt, 10000, 512, 'sha512').toString('hex')

		if (hash === userProfile.legacyHash) {
			logger.info(`User verified: ${email}`)
			return { valid: true, id: userProfile.id }
		}
		return { valid: false }
	} catch (error) {
		if (error instanceof Prisma.NotFoundError) {
			logger.error(`User not found: ${email}`)
			throw new Error(`User not found: ${email}`)
		}
		if (error instanceof Error) {
			logger.error({ message: error.message }, { name: error.name, stack: error.stack })
			throw error
		}
		throw error
	}
}
