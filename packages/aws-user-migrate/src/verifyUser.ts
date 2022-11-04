import { prisma } from '@weareinreach/db'
import { Prisma } from '@weareinreach/db/prisma'
import crypto from 'crypto'

type VerifyUser = (email: string, password: string) => Promise<boolean>

export const verifyUser: VerifyUser = async (email, password) => {
	try {
		const userProfile = await prisma.user.findUniqueOrThrow({
			where: {
				email: email,
			},
		})

		if (typeof userProfile.legacySalt !== 'string') {
			console.error(`No legacySalt for ${email}`)
			throw new Error(`No legacySalt for ${email}`)
		}

		const hash = crypto.pbkdf2Sync(password, userProfile.legacySalt, 10000, 512, 'sha512').toString('hex')

		if (hash === userProfile.legacyHash) {
			console.log(`User verified: ${email}`)
			return true
		}
		return false
	} catch (error) {
		if (error instanceof Prisma.NotFoundError) {
			console.error(`User not found: ${email}`)
			throw new Error(`User not found: ${email}`)
		}
		console.error(error)
		throw error
	}
}
