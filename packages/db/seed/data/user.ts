import { type Prisma } from '@prisma/client'

export const userEmail = 'inreach_svc@inreach.org'
export const localeCode = 'en'
export const userType = 'System'

export const seedUser: Prisma.UserCreateInput = {
	name: 'Database Seed User',
	email: userEmail,
	role: {
		connectOrCreate: {
			where: { name: userType },
			create: {
				name: userType,
			},
		},
	},
	langPref: {
		connectOrCreate: {
			where: {
				localeCode,
			},
			create: {
				localeCode,
				primary: true,
				languageName: 'English',
				nativeName: 'English',
				iso6392: 'eng',
			},
		},
	},
	userType: {
		connectOrCreate: {
			where: {
				type: userType,
			},
			create: {
				type: userType,
			},
		},
	},
}

export const connectUser = {
	connect: {
		email: userEmail,
	},
}
export const createdBy = connectUser

export const updatedBy = connectUser
