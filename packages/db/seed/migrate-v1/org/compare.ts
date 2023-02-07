/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */

import { writeFileSync } from 'fs'

import { Prisma } from '~db/client'
import { queryClient } from '~db/seed/migrate-v1/org/clients'
import { BatchNames } from '~db/seed/migrate-v1/org/outData'
import { ZodInput } from '~db/seed/migrate-v1/org/zod'

const diffMap = new Map<BatchNames, ZodInput<BatchNames>[]>()

type Compare = <T extends BatchNames>(
	tx: Prisma.TransactionClient,
	input: ZodInput<T>[],
	batchName: T
) => void
export const compare: Compare = async (tx, input, batchName: BatchNames) => {
	switch (batchName) {
		case 'freeText':
		case 'translationKey': {
			const inData = input as ZodInput<typeof batchName>[]
			const where = { key: { in: inData.map((item) => item.key) } }
			const results = await queryClient[batchName](tx, { where, select: { key: true } })
			const flatResults = results.map((x) => x.key)
			const diff = inData.filter((item) => !flatResults.includes(item.key))
			const diffData = [...(diffMap.get(batchName) ?? []), ...diff]
			diffMap.set(batchName, diffData)
			break
		}
		case 'orgServicePhone':
		case 'orgServiceEmail':
		case 'orgServiceTag':
		case 'orgLocationService': {
			const inData = input as ZodInput<typeof batchName>[]
			const where = { serviceId: { in: inData.map((item) => item.serviceId) } }
			const results = await queryClient[batchName](tx, { where, select: { serviceId: true } })
			const flatResults = results.map((x) => x.serviceId)
			const diff = inData.filter((item) => !flatResults.includes(item.serviceId))
			const diffData = [...(diffMap.get(batchName) ?? []), ...diff]
			diffMap.set(batchName, diffData)
			break
		}
		case 'orgWebsiteLanguage': {
			const inData = input as ZodInput<typeof batchName>[]
			const where = { languageId: { in: inData.map((item) => item.languageId) } }
			const results = await queryClient[batchName](tx, { where, select: { languageId: true } })
			const flatResults = results.map((x) => x.languageId)
			const diff = inData.filter((item) => !flatResults.includes(item.languageId))
			const diffData = [...(diffMap.get(batchName) ?? []), ...diff]
			diffMap.set(batchName, diffData)
			break
		}
		case 'serviceAreaCountry':
		case 'serviceAreaDist': {
			const inData = input as ZodInput<typeof batchName>[]
			const where = { serviceAreaId: { in: inData.map((item) => item.serviceAreaId) } }
			const results = await queryClient[batchName](tx, { where, select: { serviceAreaId: true } })
			const flatResults = results.map((x) => x.serviceAreaId)
			const diff = inData.filter((item) => !flatResults.includes(item.serviceAreaId))
			const diffData = [...(diffMap.get(batchName) ?? []), ...diff]
			diffMap.set(batchName, diffData)
			break
		}
		case 'organizationAttribute':
		case 'serviceAttribute':
		case 'serviceAccessAttribute': {
			const inData = input as ZodInput<typeof batchName>[]
			const where = { attributeId: { in: inData.map((item) => item.attributeId) } }
			const results = await queryClient[batchName](tx, { where, select: { attributeId: true } })
			const flatResults = results.map((x) => x.attributeId)
			const diff = inData.filter((item) => !flatResults.includes(item.attributeId))
			const diffData = [...(diffMap.get(batchName) ?? []), ...diff]
			diffMap.set(batchName, diffData)
			break
		}
		case 'orgLocation':
		case 'orgPhone':
		case 'orgEmail':
		case 'orgWebsite':
		case 'orgSocialMedia':
		case 'outsideAPI':
		case 'orgPhoto':
		case 'orgHours':
		case 'orgService':
		case 'serviceAccess':
		case 'serviceArea': {
			const inData = input as ZodInput<typeof batchName>[]
			const where = { id: { in: inData.map((item) => item.id as string) } }
			const results = await queryClient[batchName](tx, { where, select: { id: true } })
			const flatResults = results.map((x) => x.id)
			const diff = inData.filter((item) => !flatResults.includes(item.id))
			const diffData = [...(diffMap.get(batchName) ?? []), ...diff]
			diffMap.set(batchName, diffData)
			break
		}
		case 'userToOrganization':
		case 'userPermission':
		case 'organizationPermission': {
			const inData = input as ZodInput<typeof batchName>[]
			const where = { userId: { in: inData.map((item) => item.userId) } }
			const results = await queryClient[batchName](tx, { where, select: { userId: true } })
			const flatResults = results.map((x) => x.userId)
			const diff = inData.filter((item) => !flatResults.includes(item.userId))
			const diffData = [...(diffMap.get(batchName) ?? []), ...diff]
			diffMap.set(batchName, diffData)
			break
		}

		default: {
			throw new Error('Unmapped comparison!')
			break
		}
	}
}
export const writeOutDiff = () => {
	writeFileSync('./skipped.json', JSON.stringify(Object.fromEntries(diffMap)))
}
