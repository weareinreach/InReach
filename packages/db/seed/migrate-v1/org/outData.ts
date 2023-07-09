import superjson from 'superjson'
import invariant from 'tiny-invariant'

import { existsSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { resolve } from 'path'

import { type Prisma } from '~db/index'
import { iconList, type Log } from '~db/seed/lib'
import { migrateLog } from '~db/seed/logger'
import { type ListrTask } from '~db/seed/migrate-v1'

export const outputDir = `${resolve(__dirname, '../out')}/`

type InitialData = {
	orgTranslationKey: Set<Prisma.TranslationKeyCreateManyInput>
	orgFreeText: Set<Prisma.FreeTextCreateManyInput>
	organization: Set<Prisma.OrganizationCreateManyInput>
}

export type OutData = {
	organization: Set<Prisma.OrganizationCreateManyInput>
	translationKey: Set<Prisma.TranslationKeyCreateManyInput>
	freeText: Set<Prisma.FreeTextCreateManyInput>
	phoneType: Set<Prisma.PhoneTypeCreateManyInput>
	orgLocation: Set<Prisma.OrgLocationCreateManyInput>
	orgPhone: Set<Prisma.OrgPhoneCreateManyInput>
	orgEmail: Set<Prisma.OrgEmailCreateManyInput>
	orgWebsite: Set<Prisma.OrgWebsiteCreateManyInput>
	orgWebsiteLanguage: Set<Prisma.OrgWebsiteLanguageCreateManyInput>
	orgSocialMedia: Set<Prisma.OrgSocialMediaCreateManyInput>
	outsideAPI: Set<Prisma.OutsideAPICreateManyInput>
	orgPhoto: Set<Prisma.OrgPhotoCreateManyInput>
	orgHours: Set<Prisma.OrgHoursCreateManyInput>
	orgService: Set<Prisma.OrgServiceCreateManyInput>
	attributeSupplement: Set<Prisma.AttributeSupplementCreateManyInput>
	orgServicePhone: Set<Prisma.OrgServicePhoneCreateManyInput>
	orgServiceEmail: Set<Prisma.OrgServiceEmailCreateManyInput>
	orgLocationService: Set<Prisma.OrgLocationServiceCreateManyInput>
	orgServiceTag: Set<Prisma.OrgServiceTagCreateManyInput>
	organizationAttribute: Set<Prisma.OrganizationAttributeCreateManyInput>
	serviceAttribute: Set<Prisma.ServiceAttributeCreateManyInput>
	serviceAccessAttribute: Set<Prisma.ServiceAccessAttributeCreateManyInput>
	serviceArea: Set<Prisma.ServiceAreaCreateManyInput>
	serviceAreaCountry: Set<Prisma.ServiceAreaCountryCreateManyInput>
	serviceAreaDist: Set<Prisma.ServiceAreaDistCreateManyInput>
	userToOrganization: Set<Prisma.UserToOrganizationCreateManyInput>
	userPermission: Set<Prisma.UserPermissionCreateManyInput>
	organizationPermission: Set<Prisma.OrganizationPermissionCreateManyInput>
	organizationEmail: Set<Prisma.OrganizationEmailCreateManyInput>
	organizationPhone: Set<Prisma.OrganizationPhoneCreateManyInput>
}
type SetType<T> = T extends Set<infer R> ? R : T
export type OutDataRaw = {
	[K in keyof OutData]: SetType<OutData[K]>[]
}

type RollbackObj = {
	[K in keyof (OutData & InitialData)]: Set<string>
}

export const initialData: InitialData = {
	orgTranslationKey: new Set(),
	orgFreeText: new Set(),
	organization: new Set(),
}

export const data: OutData = {
	organization: new Set(),
	translationKey: new Set(),
	freeText: new Set(),
	phoneType: new Set(),
	orgLocation: new Set(),
	orgPhone: new Set(),
	orgEmail: new Set(),
	orgWebsite: new Set(),
	orgWebsiteLanguage: new Set(),
	orgSocialMedia: new Set(),
	outsideAPI: new Set(),
	orgPhoto: new Set(),
	orgHours: new Set(),
	orgService: new Set(),
	attributeSupplement: new Set(),
	serviceArea: new Set(),
	serviceAreaCountry: new Set(),
	serviceAreaDist: new Set(),
	orgServicePhone: new Set(),
	orgServiceEmail: new Set(),
	orgLocationService: new Set(),
	orgServiceTag: new Set(),
	organizationAttribute: new Set(),
	serviceAttribute: new Set(),
	serviceAccessAttribute: new Set(),
	userToOrganization: new Set(),
	userPermission: new Set(),
	organizationPermission: new Set(),
	organizationEmail: new Set(),
	organizationPhone: new Set(),
} as const

export type BatchNames = Readonly<keyof OutData>

export const batchNameMap = new Map<BatchNames, string>([
	['organization', 'Organization records'],
	['translationKey', 'Translation keys'],
	['freeText', 'Free text link records'],
	['phoneType', 'Phone Types'],
	['orgLocation', 'Organization locations'],
	['orgPhone', 'Phone records'],
	['orgEmail', 'Email records'],
	['orgWebsite', 'Website records'],
	['orgWebsiteLanguage', 'Website Language Links'],
	['orgSocialMedia', 'Social media records'],
	['outsideAPI', 'Outside API connection records'],
	['orgPhoto', 'Organization photo records'],
	['orgHours', 'Operating hours records'],
	['orgService', 'Service records'],
	['attributeSupplement', 'Attribute supplements'],
	['serviceArea', 'Service area records'],
	['serviceAreaCountry', 'Service area country links'],
	['serviceAreaDist', 'Service area district links'],

	['orgServicePhone', 'Phone -> Organization links'],
	['orgServiceEmail', 'Email -> Organization links'],
	['organizationEmail', 'Email -> Organization links'],
	['organizationPhone', 'Phone -> Organization links'],
	['orgLocationService', 'Service -> Location links'],
	['orgServiceTag', 'Tag -> Service links'],
	['organizationAttribute', 'Attribute -> Organization links'],
	['serviceAttribute', 'Attribute -> Service links'],
	['serviceAccessAttribute', 'Attribute -> Service Access links'],
	['userToOrganization', 'User -> Organization links'],
	['userPermission', 'Permission -> User links'],
	['organizationPermission', 'User Permission -> Organization links'],
])

export type RollbackKeys =
	| 'organization'
	| 'orgLocation'
	| 'translationKey'
	| 'orgPhone'
	| 'orgEmail'
	| 'orgWebsite'
	| 'orgSocialMedia'
	| 'outsideAPI'
	| 'orgPhoto'
	| 'orgHours'
	| 'orgService'
	| 'attributeSupplement'
	| 'serviceArea'
	| 'userPermission'

export type Rollback = Pick<RollbackObj, RollbackKeys>

export const rollback: Rollback = {
	organization: new Set(),
	orgLocation: new Set(),
	translationKey: new Set(),
	orgPhone: new Set(),
	orgEmail: new Set(),
	orgWebsite: new Set(),
	orgSocialMedia: new Set(),
	outsideAPI: new Set(),
	orgPhoto: new Set(),
	orgHours: new Set(),
	orgService: new Set(),
	attributeSupplement: new Set(),
	serviceArea: new Set(),
	userPermission: new Set(),
}

export const batchCount = new Map<string, number>()

export const getFileName = (batchName: BatchNames | 'rollback') => `${outputDir}${batchName}.json`

export const writeBatches = (task: ListrTask, clear = false) => {
	const log: Log = (message, icon?, indent = false, silent = false) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		migrateLog.info(formattedMessage)
		if (!silent) task.output = formattedMessage
	}
	if (clear) {
		const file = getFileName('rollback')
		if (existsSync(file)) {
			rmSync(file)
			log(`Deleting rollback file`, 'trash', false, true)
		}
	}
	for (const [batchName, batchData] of Object.entries(data) as Readonly<Entries<typeof data>>) {
		const batchFile = getFileName(batchName)
		if (clear) {
			const outputData = new Set()
			writeFileSync(batchFile, superjson.stringify(outputData))
			log(`Clearing file: ${batchName}.json`, 'trash', false, true)
		} else {
			const currentCount = batchCount.get(batchName) ?? 0
			const currentBatchCount = batchData.size
			const existingBatch = existsSync(batchFile)
				? superjson.parse<OutData[typeof batchName]>(readFileSync(batchFile, 'utf-8'))
				: []
			const outputData = new Set([...existingBatch, ...batchData])
			writeFileSync(batchFile, superjson.stringify(outputData))

			batchCount.set(batchName, currentCount + currentBatchCount)

			log(
				`Records added to ${batchName}.json: ${currentBatchCount} (Total records in file: ${outputData.size})`,
				'write',
				true
			)
			data[batchName].clear()
		}
	}
}

export const getDescription = (batchName: BatchNames) => {
	const description = batchNameMap.get(batchName)
	invariant(description)
	return description
}

type Entries<T> = {
	[K in keyof T]: [K, T[K]]
}[keyof T][]
