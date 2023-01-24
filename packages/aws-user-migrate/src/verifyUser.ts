import { Prisma, prisma } from '@weareinreach/db'

import crypto from 'crypto'

import { logger } from './logger'

type VerifyUser = (email: string, password: string) => Promise<boolean | undefined>

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

		if (!userProfile.legacySalt) {
			logger.error(`No legacySalt for ${email}`)
			throw new Error(`No legacySalt for ${email}`)
		}
		if (!userProfile.legacyHash) {
			logger.error(`No legacyHash for ${email}`)
			throw new Error(`No legacyHash for ${email}`)
		}

		const hash = crypto.pbkdf2Sync(password, userProfile.legacySalt, 10000, 512, 'sha512').toString('hex')

		if (hash === userProfile.legacyHash) {
			logger.info(`User verified: ${email}`)
			return true
		}
		return false
	} catch (error) {
		if (error instanceof Prisma.NotFoundError) {
			logger.error(`User not found: ${email}`)
			throw new Error(`User not found: ${email}`)
		}
		if (error instanceof Error) {
			logger.error({ message: error.message }, { name: error.name, stack: error.stack })
			throw error
		}
	}
}
