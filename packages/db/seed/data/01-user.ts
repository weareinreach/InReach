import { Prisma } from '@prisma/client'
import slugify from 'slugify'

import { namespaces } from './00-namespaces'

export const userEmail = 'inreach_svc@inreach.org'
export const localeCode = 'en'
export const userType = 'System'
export const translationNamespace = namespaces.user
export const key = `type-${userType.toLowerCase()}`

export const seedUser: Prisma.UserCreateInput = {
	firstName: 'System',
	lastName: 'User',
	email: userEmail,
	role: {
		connectOrCreate: {
			where: { name: userType },
			create: {
				name: userType,
				tag: slugify(userType),
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
				key: {
					create: {
						key: key,
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

export const userRoleList = [
	{ type: 'seeker', name: 'Resource Seeker' },
	{ type: 'provider', name: 'Service Provider' },
	{ type: 'lcr', name: 'Local Community Reviewer' },
	{ type: 'dataManager', name: 'Data Manager' },
	{ type: 'dataAdmin', name: 'Data Administrator' },
	{ type: 'sysadmin', name: 'System Administrator' },
]

export const userTypes: Prisma.UserTypeUpsertArgs[] = userRoleList.map((role) => ({
	where: {
		type: role.type,
	},
	create: {
		type: role.type,
		key: {
			create: {
				key: role.type,
				text: role.name,

				namespace: {
					connect: {
						name: namespaces.user,
					},
				},
			},
		},
	},
	update: {},
}))

export const userRoles: Prisma.UserRoleUpsertArgs[] = userRoleList.map((role) => ({
	where: {
		name: role.name,
	},
	create: {
		name: role.name,
		tag: slugify(role.name),
	},
	update: {},
}))
