import invariant from 'tiny-invariant'

import { slug, generateId, Prisma } from '~db/index'

import { namespaces } from './00-namespaces'

export const userEmail = 'inreach_svc@inreach.org'
export const localeCode = 'en'
export const userType = { text: 'System', tsKey: 'system', tsNs: namespaces.user }
export const translationNamespace = namespaces.user
export const key = (str: string) => slug(`type-${str}`)

export const userRoleMap = new Map<string, string>()
export const userTypeMap = new Map<string, string>()

export const genSeedUser = () => {
	const userTypeId = userTypeMap.get(key(userType.tsKey))
	invariant(userTypeId)

	const data: Prisma.UserCreateManyInput = {
		id: generateId('user', 0),
		email: userEmail,
		userTypeId,
		name: 'System User',
	}
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return data
}

export const userRoleList = [
	{ type: 'seeker', name: 'Resource Seeker' },
	{ type: 'provider', name: 'Service Provider' },
	{ type: 'lcr', name: 'Local Community Reviewer' },
	{ type: 'dataManager', name: 'Data Manager' },
	{ type: 'dataAdmin', name: 'Data Administrator' },
	{ type: 'sysadmin', name: 'System Administrator' },
	{ type: 'system', name: 'System User' },
]
