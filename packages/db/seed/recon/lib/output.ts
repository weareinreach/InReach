import superjson from 'superjson'
import { type LiteralUnion } from 'type-fest'

import fs from 'fs'
import path from 'path'

import { type Prisma } from '~db/client'
import { formatMessage } from '~db/seed/recon/lib/logger'
import { type PassedTask } from '~db/seed/recon/lib/types'

const outputDir = path.resolve(__dirname, '../output')
const createDir = path.resolve(outputDir, 'create')
const updateDir = path.resolve(outputDir, 'update')
const deleteDir = path.resolve(outputDir, 'delete')
const execptionDir = path.resolve(outputDir, 'exceptions')

export const getBatchFile: GetBatchFile = ({ type, batchName }) => {
	switch (type) {
		case 'create': {
			return `${createDir}/${batchName}.json`
		}
		case 'update': {
			return `${updateDir}/${batchName}.json`
		}
		case 'delete': {
			return `${deleteDir}/${batchName}.json`
		}
		case 'exceptions': {
			return `${execptionDir}/${batchName}.json`
		}
	}
}
export const create = {
	organization: new Set<Prisma.OrganizationCreateManyInput>(),
	translationKey: new Set<Prisma.TranslationKeyCreateManyInput>(),
	freeText: new Set<Prisma.FreeTextCreateManyInput>(),
	phoneType: new Set<Prisma.PhoneTypeCreateManyInput>(),
	orgLocation: new Set<Prisma.OrgLocationCreateManyInput>(),
	orgPhone: new Set<Prisma.OrgPhoneCreateManyInput>(),
	orgEmail: new Set<Prisma.OrgEmailCreateManyInput>(),
	orgWebsite: new Set<Prisma.OrgWebsiteCreateManyInput>(),
	orgWebsiteLanguage: new Set<Prisma.OrgWebsiteLanguageCreateManyInput>(),
	orgSocialMedia: new Set<Prisma.OrgSocialMediaCreateManyInput>(),
	outsideAPI: new Set<Prisma.OutsideAPICreateManyInput>(),
	orgPhoto: new Set<Prisma.OrgPhotoCreateManyInput>(),
	orgHours: new Set<Prisma.OrgHoursCreateManyInput>(),
	orgService: new Set<Prisma.OrgServiceCreateManyInput>(),
	attributeSupplement: new Set<Prisma.AttributeSupplementCreateManyInput>(),
	orgServicePhone: new Set<Prisma.OrgServicePhoneCreateManyInput>(),
	orgServiceEmail: new Set<Prisma.OrgServiceEmailCreateManyInput>(),
	orgLocationService: new Set<Prisma.OrgLocationServiceCreateManyInput>(),
	orgServiceTag: new Set<Prisma.OrgServiceTagCreateManyInput>(),
	organizationAttribute: new Set<Prisma.OrganizationAttributeCreateManyInput>(),
	serviceAttribute: new Set<Prisma.ServiceAttributeCreateManyInput>(),
	serviceAccessAttribute: new Set<Prisma.ServiceAccessAttributeCreateManyInput>(),
	serviceArea: new Set<Prisma.ServiceAreaCreateManyInput>(),
	serviceAreaCountry: new Set<Prisma.ServiceAreaCountryCreateManyInput>(),
	serviceAreaDist: new Set<Prisma.ServiceAreaDistCreateManyInput>(),
	userToOrganization: new Set<Prisma.UserToOrganizationCreateManyInput>(),
	userPermission: new Set<Prisma.UserPermissionCreateManyInput>(),
	organizationPermission: new Set<Prisma.OrganizationPermissionCreateManyInput>(),
	organizationEmail: new Set<Prisma.OrganizationEmailCreateManyInput>(),
	organizationPhone: new Set<Prisma.OrganizationPhoneCreateManyInput>(),
	slugRedirect: new Set<Prisma.SlugRedirectCreateManyInput>(),
	auditLog: new Set<Prisma.AuditLogCreateManyInput>(),
}

export const update = {
	organization: new Set<Prisma.OrganizationUpdateArgs>(),
	translationKey: new Set<Prisma.TranslationKeyUpdateArgs>(),
	orgLocation: new Set<Prisma.OrgLocationUpdateArgs>(),
	orgPhone: new Set<Prisma.OrgPhoneUpdateArgs>(),
	orgEmail: new Set<Prisma.OrgEmailUpdateArgs>(),
	orgWebsite: new Set<Prisma.OrgWebsiteUpdateArgs>(),
	orgSocialMedia: new Set<Prisma.OrgSocialMediaUpdateArgs>(),
	orgService: new Set<Prisma.OrgServiceUpdateArgs>(),
	orgPhoto: new Set<Prisma.OrgPhotoUpdateArgs>(),
	attributeSupplement: new Set<Prisma.AttributeSupplementUpdateArgs>(),
	organizationAttribute: new Set<Prisma.OrganizationAttributeUpdateArgs>(),
	serviceArea: new Set<Prisma.ServiceAreaUpdateArgs>(),
	serviceAccessAttribute: new Set<Prisma.ServiceAccessAttributeUpdateArgs>(),
}

export const deleteRecord = {
	organizationAttribute: new Set<Prisma.OrganizationAttributeDeleteManyArgs>(),
}

export const crowdin = {
	create: new Set<{ text: string; key: string }>(),
	update: new Set<
		{ id: number; text: string; delete?: never } | { id: number; delete: true; text?: never }
	>(),
}
interface ExceptionItem {
	organizationId: string
	record: unknown
	existing?: unknown
}
export const exceptions = {
	phone: new Set<ExceptionItem>(),
	location: new Set<ExceptionItem>(),
	socialMedia: new Set<ExceptionItem>(),
}
export const batchCount = new Map<string, number>()
export const writeBatches = (task: PassedTask, clear = false) => {
	// Create
	for (const batchName in create) {
		const batch = create[batchName]
		const batchFile = getBatchFile({ type: 'create', batchName })
		if (clear) {
			if (fs.existsSync(batchFile)) {
				fs.rmSync(batchFile)
				task.output = formatMessage(`Deleting file: ${batchFile}`, 'trash')
			}
		} else {
			if (!batch.size) {
				task.output = formatMessage(`Skipping empty batch: ${batchName}`, 'skip')
				continue
			}
			const currentCount = batchCount.get(`create.${batchName}`) ?? 0
			const currentBatchCount = batch.size
			const existingBatch = fs.existsSync(batchFile)
				? superjson.parse<Set<unknown>>(fs.readFileSync(batchFile, 'utf-8'))
				: []
			const outputData = new Set([...existingBatch, ...batch])
			fs.writeFileSync(batchFile, superjson.stringify(outputData))
			batchCount.set(`create.${batchName}`, currentCount + currentBatchCount)
			task.output = formatMessage(
				`Records added to create/${batchName}.json: ${currentBatchCount} (Total records in file: ${outputData.size})`,
				'write',
				true
			)
			create[batchName].clear()
		}
	}
	// Updates
	for (const batchName in update) {
		const batch = update[batchName]
		const batchFile = getBatchFile({ type: 'update', batchName })
		if (clear) {
			if (fs.existsSync(batchFile)) {
				fs.rmSync(batchFile)
				task.output = formatMessage(`Deleting file: ${batchFile}`, 'trash')
			}
		} else {
			if (!batch.size) {
				task.output = formatMessage(`Skipping empty batch: ${batchName}`, 'skip')
				continue
			}
			const currentCount = batchCount.get(`update.${batchName}`) ?? 0
			const currentBatchCount = batch.size
			const existingBatch = fs.existsSync(batchFile)
				? superjson.parse<Set<unknown>>(fs.readFileSync(batchFile, 'utf-8'))
				: []
			const outputData = new Set([...existingBatch, ...batch])
			fs.writeFileSync(batchFile, superjson.stringify(outputData))
			batchCount.set(`update.${batchName}`, currentCount + currentBatchCount)
			task.output = formatMessage(
				`Records added to update/${batchName}.json: ${currentBatchCount} (Total records in file: ${outputData.size})`,
				'write',
				true
			)
			update[batchName].clear()
		}
	}
	// Deletions
	for (const batchName in deleteRecord) {
		const batch = deleteRecord[batchName]
		const batchFile = getBatchFile({ type: 'delete', batchName })
		if (clear) {
			if (fs.existsSync(batchFile)) {
				fs.rmSync(batchFile)
				task.output = formatMessage(`Deleting file: ${batchFile}`, 'trash')
			}
		} else {
			if (!batch.size) {
				task.output = formatMessage(`Skipping empty batch: ${batchName}`, 'skip')
				continue
			}
			const currentCount = batchCount.get(`delete.${batchName}`) ?? 0
			const currentBatchCount = batch.size
			const existingBatch = fs.existsSync(batchFile)
				? superjson.parse<Set<unknown>>(fs.readFileSync(batchFile, 'utf-8'))
				: []
			const outputData = new Set([...existingBatch, ...batch])
			fs.writeFileSync(batchFile, superjson.stringify(outputData))
			batchCount.set(`delete.${batchName}`, currentCount + currentBatchCount)
			task.output = formatMessage(
				`Records added to delete/${batchName}.json: ${currentBatchCount} (Total records in file: ${outputData.size})`,
				'write',
				true
			)
			deleteRecord[batchName].clear()
		}
	}
	// Exceptions
	for (const batchName in exceptions) {
		const batch = exceptions[batchName]
		const batchFile = getBatchFile({ type: 'exceptions', batchName })
		if (clear) {
			if (fs.existsSync(batchFile)) {
				fs.rmSync(batchFile)
				task.output = formatMessage(`Deleting file: ${batchFile}`, 'trash')
			}
		} else {
			if (!batch.size) {
				task.output = formatMessage(`Skipping empty batch: ${batchName}`, 'skip')
				continue
			}
			const currentCount = batchCount.get(`exceptions.${batchName}`) ?? 0
			const currentBatchCount = batch.size
			const existingBatch = fs.existsSync(batchFile)
				? superjson.parse<Set<unknown>>(fs.readFileSync(batchFile, 'utf-8'))
				: []
			const outputData = new Set([...existingBatch, ...batch])
			fs.writeFileSync(batchFile, superjson.stringify(outputData))
			batchCount.set(`exceptions.${batchName}`, currentCount + currentBatchCount)
			task.output = formatMessage(
				`Records added to exceptions/${batchName}.json: ${currentBatchCount} (Total records in file: ${outputData.size})`,
				'write',
				true
			)
			exceptions[batchName].clear()
		}
	}
	if (crowdin.create) {
		const batch = crowdin.create
		const batchFile = getBatchFile({ type: 'create', batchName: 'crowdin' })
		if (clear) {
			if (fs.existsSync(batchFile)) {
				fs.rmSync(batchFile)
				task.output = formatMessage(`Deleting file: ${batchFile}`, 'trash')
			}
		} else {
			if (!batch.size) {
				task.output = formatMessage(`Skipping empty batch: CrowdIn Additions`, 'skip')
			} else {
				const currentCount = batchCount.get(`create.crowdin`) ?? 0
				const currentBatchCount = batch.size
				const existingBatch = fs.existsSync(batchFile)
					? superjson.parse<Set<unknown>>(fs.readFileSync(batchFile, 'utf-8'))
					: []
				const crowdinActions = [...batch].map(({ text, key: identifier }) => ({
					op: 'add',
					path: '/-',
					value: { text, identifier, fileId: 794 },
				}))
				const outputData = new Set([...existingBatch, ...crowdinActions])
				fs.writeFileSync(batchFile, superjson.stringify(outputData))
				batchCount.set(`create.crowdin`, currentCount + currentBatchCount)
				task.output = formatMessage(
					`Records added to create/crowdin.json: ${currentBatchCount} (Total records in file: ${outputData.size})`,
					'write',
					true
				)
				crowdin.create.clear()
			}
		}
	}
	if (crowdin.update) {
		const batch = crowdin.update
		const batchFile = getBatchFile({ type: 'update', batchName: 'crowdin' })
		if (clear) {
			if (fs.existsSync(batchFile)) {
				fs.rmSync(batchFile)
				task.output = formatMessage(`Deleting file: ${batchFile}`, 'trash')
			}
		} else {
			if (!batch.size) {
				task.output = formatMessage(`Skipping empty batch: CrowdIn Updates`, 'skip')
			} else {
				const currentCount = batchCount.get(`update.crowdin`) ?? 0
				const currentBatchCount = batch.size
				const existingBatch = fs.existsSync(batchFile)
					? superjson.parse<Set<unknown>>(fs.readFileSync(batchFile, 'utf-8'))
					: []
				const crowdinActions = [...batch].map((item) =>
					item.delete
						? { op: 'remove', path: `/${item.id}` }
						: {
								op: 'replace',
								path: `/${item.id}/text`,
								value: item.text,
						  }
				)
				const outputData = new Set([...existingBatch, ...crowdinActions])
				fs.writeFileSync(batchFile, superjson.stringify(outputData))
				batchCount.set(`update.crowdin`, currentCount + currentBatchCount)
				task.output = formatMessage(
					`Records added to update/crowdin.json: ${currentBatchCount} (Total records in file: ${outputData.size})`,
					'write',
					true
				)
				crowdin.create.clear()
			}
		}
	}
}

interface GetCreateParams {
	type: 'create'
	batchName: LiteralUnion<keyof typeof create, string>
}
interface GetUpdateParams {
	type: 'update'
	batchName: LiteralUnion<keyof typeof update, string>
}
interface GetDeleteParams {
	type: 'delete'
	batchName: LiteralUnion<keyof typeof deleteRecord, string>
}
interface GetExceptionsParams {
	type: 'exceptions'
	batchName: LiteralUnion<keyof typeof exceptions, string>
}

type GetBatchFile = (
	params: GetCreateParams | GetUpdateParams | GetDeleteParams | GetExceptionsParams
) => string
