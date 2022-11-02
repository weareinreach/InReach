import { prisma } from '../../index'
import { localeCode, seedUser, userEmail, userType } from '../data/user'

export const seedSystemUser = async () => {
	try {
		console.info(`Seeding 'System' user`)
		// create user if it does not exist.
		await prisma.user.upsert({
			where: {
				email: userEmail,
			},
			update: seedUser,
			create: seedUser,
			select: {
				id: true,
			},
		})

		// updated the 'createdBy' and 'updatedBy' fields for 'Language', 'UserType' & 'UserRole
		const updateData = {
			createdBy: {
				connect: {
					email: userEmail,
				},
			},
			updatedBy: {
				connect: {
					email: userEmail,
				},
			},
		}
		console.log(`Updating createdBy/updatedBy for 'Language (${localeCode})'`)
		await prisma.language.update({
			where: {
				localeCode: localeCode,
			},
			data: updateData,
		})
		console.log(`Updating createdBy/updatedBy for 'UserType (${userType})'`)
		await prisma.userType.update({
			where: {
				type: userType,
			},
			data: updateData,
		})
		console.log(`Updating createdBy/updatedBy for 'UserRole (${userType})'`)
		await prisma.userRole.update({
			where: {
				name: userType,
			},
			data: updateData,
		})
	} catch (err) {
		console.error(err)
	}
}
