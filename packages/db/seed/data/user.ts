import { type Prisma } from '@prisma/client'

export const userEmail = 'inreach_svc@inreach.org'
export const langCode = 'en'
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
				langCode,
			},
			create: {
				langCode,
				languageName: 'English',
				nativeName: 'English',
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
