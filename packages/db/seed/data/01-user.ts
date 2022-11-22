import { type Prisma } from '@prisma/client'

import { namespaces } from './00-namespaces'

export const userEmail = 'inreach_svc@inreach.org'
export const localeCode = 'en'
export const userType = 'System'
export const translationNamespace = namespaces.user
export const translationKey = `type-${userType.toLowerCase()}`

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
				translationKey: {
					create: {
						key: translationKey,
						text: userType,
						context: 'User type: system user',
						namespace: {
							connectOrCreate: {
								where: {
									name: translationNamespace,
								},
								create: {
									name: translationNamespace,
								},
							},
						},
					},
				},
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

export const createMeta = { createdBy, updatedBy }
export const updateMeta = { updatedBy }
