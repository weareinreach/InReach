/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import slugify from 'slugify'

import { userRoleList } from '../data'
import { logFile } from '../logger'

import { Prisma } from '~db/client'
import { prisma } from '~db/index'
import { genSeedUser, namespaceGen, namespaces, userRoleMap, userTypeMap } from '~db/seed/data'
import { Log, iconList } from '~db/seed/lib'
import { ListrTask } from '~db/seed/starterData'

export const seedSystemUser = async (task: ListrTask) => {
	try {
		// create user if it does not exist.
		const data = genSeedUser()

		const result = await prisma.user.createMany({ data, skipDuplicates: true })

		const logMessage = result.count === 1 ? `System user created` : `System user already exists`
		logFile.info(logMessage)
		task.output = logMessage
		task.title = `System user (${result.count} ${result.count === 1 ? 'record' : 'records'})`
	} catch (err) {
		logFile.error(err)
		throw err
	}
}

export const seedTranslationNamespaces = async (task: ListrTask) => {
	const log: Log = (message, icon?) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${dispIcon}${message}`
		logFile.info(formattedMessage)
		task.output = formattedMessage
	}
	let countA = 1
	const totalLength = Object.keys(namespaces).length
	const data: Prisma.TranslationNamespaceCreateManyInput[] = []
	const namespaceItems = [...new Set<string>(Object.values(namespaces))]
	for (const item of namespaceItems) {
		const exportFile = namespaceGen[item] ?? true
		log(
			`(${countA}/${totalLength}) Preparing Translation Namespace Record '${item}' (export: ${exportFile})`,
			'generate'
		)
		data.push({
			name: item,
			exportFile,
		})
		countA++
	}

	const namespaceData = await prisma.translationNamespace.createMany({ data, skipDuplicates: true })
	log(`Total Translation Namespace records inserted: ${namespaceData.count}`, 'create')
	task.title = `Translation Namespaces (${namespaceData.count} ${
		namespaceData.count === 1 ? 'record' : 'records'
	})`
}

type UserTypeData = {
	translate: Prisma.TranslationKeyCreateManyInput[]
	userType: Prisma.UserTypeCreateManyInput[]
}
export const seedUserTypes = async (task: ListrTask) => {
	const log: Log = (message, icon?) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${dispIcon}${message}`
		logFile.info(formattedMessage)
		task.output = formattedMessage
	}
	const key = (str: string) => slugify(`type-${str}`, { lower: true, strict: true })
	const ns = namespaces.user

	const data: UserTypeData = {
		translate: [],
		userType: [],
	}
	let countA = 0
	for (const record of userRoleList) {
		log(`(${countA}/${userRoleList.length}) Preparing User Type record: ${record.name}`, 'generate')

		const tsKey = key(record.type)
		data.translate.push({
			key: tsKey,
			ns,
			text: record.name,
		})

		data.userType.push({
			tsKey,
			tsNs: ns,
			type: record.type,
		})

		countA++
	}

	const translateResult = await prisma.translationKey.createMany({
		data: data.translate,
		skipDuplicates: true,
	})
	const result = await prisma.userType.createMany({ data: data.userType, skipDuplicates: true })

	log(`User Type translation key keys created: ${translateResult.count}`, 'create')
	log(`User Type records created: ${result.count}`)

	const userTypes = await prisma.userType.findMany({ select: { id: true, tsKey: true } })

	userTypes.forEach(({ id, tsKey }) => userTypeMap.set(tsKey, id))
	task.title = `User Types (${result.count} records)`
}
export const seedUserRoles = async (task: ListrTask) => {
	const log: Log = (message, icon?) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${dispIcon}${message}`
		logFile.info(formattedMessage)
		task.output = formattedMessage
	}
	let countA = 1
	const data: Prisma.UserRoleCreateManyInput[] = userRoleList.map((role) => {
		const { name } = role
		const tag = slugify(name, { lower: true, strict: true })
		log(`(${countA}/${userRoleList.length}) Preparing User Role record: ${role.name}`, 'generate')
		countA++

		return {
			name,
			tag,
		}
	})

	const result = await prisma.userRole.createMany({ data, skipDuplicates: true })
	const roles = await prisma.userRole.findMany({ select: { id: true, tag: true } })
	roles.forEach(({ id, tag }) => userRoleMap.set(tag, id))
	task.title = `User Roles (${result.count} records)`
}
