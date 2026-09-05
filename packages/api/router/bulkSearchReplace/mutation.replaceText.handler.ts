import { buildContextUrl, syncDatabaseStringIfChanged } from '@weareinreach/crowdin/api'
import { generateNestedFreeTextUpsert, getAuditedClient, prisma } from '@weareinreach/db'
import { createLoggerInstance } from '@weareinreach/util/logger'
import { type TRPCHandlerParams } from '~api/types/handler'

import {
	type TReplaceTextItem,
	type TReplaceTextResultStatus,
	type TReplaceTextSchema,
} from './mutation.replaceText.schema'

const logger = createLoggerInstance('bulkSearchReplace.replaceText')

/**
 * Re-reads the current text at write time and only substitutes if the search term is still present -
 * deliberately not a client-computed final string. A search-then-review-then-confirm window can span an
 * arbitrary delay across many rows; if someone else edited one of these records in the meantime, blindly
 * writing a client-computed "new full text" would silently clobber their edit. Skipping (not overwriting)
 * when the term is no longer present is the whole point of this procedure existing separately from the plain
 * inline-edit mutations.
 */
const replaceFirstOccurrence = (text: string, searchTerm: string, replaceTerm: string): string | null => {
	const idx = text.toLowerCase().indexOf(searchTerm.toLowerCase())
	if (idx === -1) return null
	return text.slice(0, idx) + replaceTerm + text.slice(idx + searchTerm.length)
}

interface ItemResult {
	id: string
	recordType: TReplaceTextItem['recordType']
	field: TReplaceTextItem['field']
	status: TReplaceTextResultStatus
}

const replaceOrgDescription = async (
	item: Extract<TReplaceTextItem, { recordType: 'organization' }>,
	actorId: string
): Promise<ItemResult> => {
	const existing = await prisma.organization.findUnique({
		where: { id: item.id },
		select: {
			slug: true,
			description: { select: { tsKey: { select: { key: true, text: true, crowdinId: true } } } },
		},
	})
	const currentText = existing?.description?.tsKey.text
	if (!existing || currentText === undefined) {
		return { id: item.id, recordType: item.recordType, field: item.field, status: 'skipped-not-found' }
	}
	const newText = replaceFirstOccurrence(currentText, item.searchTerm, item.replaceTerm)
	if (newText === null) {
		return { id: item.id, recordType: item.recordType, field: item.field, status: 'skipped-not-found' }
	}

	const upsertDescription = generateNestedFreeTextUpsert({ orgId: item.id, type: 'orgDesc', text: newText })
	const crowdinId = await syncDatabaseStringIfChanged({
		key: existing.description?.tsKey.key ?? upsertDescription.upsert.create.tsKey.create.key,
		newText,
		previousText: currentText,
		previousCrowdinId: existing.description?.tsKey.crowdinId,
		context: buildContextUrl(existing.slug),
	})
	if (crowdinId) {
		upsertDescription.upsert.create.tsKey.create.crowdinId = crowdinId
	}

	const auditedClient = getAuditedClient(actorId)
	await auditedClient.organization.update({
		where: { id: item.id },
		data: { description: upsertDescription },
	})
	return { id: item.id, recordType: item.recordType, field: item.field, status: 'replaced' }
}

const replaceServiceField = async (
	item: Extract<TReplaceTextItem, { recordType: 'service' }>,
	actorId: string
): Promise<ItemResult> => {
	const existing = await prisma.orgService.findUnique({
		where: { id: item.id },
		select: {
			organizationId: true,
			organization: { select: { slug: true } },
			serviceName: { select: { tsKey: { select: { key: true, text: true, crowdinId: true } } } },
			description: { select: { tsKey: { select: { key: true, text: true, crowdinId: true } } } },
		},
	})
	if (!existing?.organizationId || !existing.organization) {
		return { id: item.id, recordType: item.recordType, field: item.field, status: 'skipped-not-found' }
	}

	const currentField = item.field === 'name' ? existing.serviceName : existing.description
	const currentText = currentField?.tsKey.text
	if (currentText === undefined) {
		return { id: item.id, recordType: item.recordType, field: item.field, status: 'skipped-not-found' }
	}
	const newText = replaceFirstOccurrence(currentText, item.searchTerm, item.replaceTerm)
	if (newText === null) {
		return { id: item.id, recordType: item.recordType, field: item.field, status: 'skipped-not-found' }
	}

	const upsertField = generateNestedFreeTextUpsert({
		orgId: existing.organizationId,
		itemId: item.id,
		type: item.field === 'name' ? 'svcName' : 'svcDesc',
		text: newText,
	})
	const crowdinId = await syncDatabaseStringIfChanged({
		key: currentField?.tsKey.key ?? upsertField.upsert.create.tsKey.create.key,
		newText,
		previousText: currentText,
		previousCrowdinId: currentField?.tsKey.crowdinId,
		context: buildContextUrl(existing.organization.slug),
	})
	if (crowdinId) {
		upsertField.upsert.create.tsKey.create.crowdinId = crowdinId
	}

	const auditedClient = getAuditedClient(actorId)
	await auditedClient.orgService.update({
		where: { id: item.id },
		data: item.field === 'name' ? { serviceName: upsertField } : { description: upsertField },
	})
	return { id: item.id, recordType: item.recordType, field: item.field, status: 'replaced' }
}

/**
 * Handles the whole checked selection in one call, looped server-side - not N network round-trips. Each item
 * is independently attempted; one item failing never blocks or rolls back the rest, since these are N
 * independent operations that happen to be triggered together, not one logical operation.
 */
const replaceText = async ({ ctx, input }: TRPCHandlerParams<TReplaceTextSchema, 'protected'>) => {
	const results: ItemResult[] = []
	for (const item of input.items) {
		try {
			const result =
				item.recordType === 'organization'
					? await replaceOrgDescription(item, ctx.actorId)
					: await replaceServiceField(item, ctx.actorId)
			results.push(result)
		} catch (error) {
			// Deliberately not `handleError` here - that always throws, which would abort the whole batch on
			// the first failure. One item failing must never block or roll back the rest.
			logger.error(error)
			results.push({ id: item.id, recordType: item.recordType, field: item.field, status: 'failed' })
		}
	}
	return {
		results,
		replaced: results.filter((r) => r.status === 'replaced').length,
		skipped: results.filter((r) => r.status === 'skipped-not-found').length,
		failed: results.filter((r) => r.status === 'failed').length,
	}
}

export default replaceText
