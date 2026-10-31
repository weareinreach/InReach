import { type JsonValue } from 'type-fest'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { getOrgRecordIds } from './lib/getOrgRecordIds'
import { type TGetAllForOrgSchema } from './query.getAllForOrg.schema'

const getAllForOrg = async ({ input }: TRPCHandlerParams<TGetAllForOrgSchema, 'protected'>) => {
	const { organizationId, page, pageSize } = input
	const skip = (page - 1) * pageSize

	// Every record id in this org's "family" (itself, its locations/services, and any phone/email linked to
	// any of those) - gathered up front so the actual AuditTrail lookup below can match against the
	// GIN-indexed `recordId` column directly, instead of the previous approach (extracting a JSON path out of
	// every single row in the table and comparing it, with no usable index), which is what made this time out
	// on production.
	const recordIds = await getOrgRecordIds(organizationId)
	if (!recordIds.length) {
		return { results: [], totalCount: 0 }
	}

	const [auditTrailRecords, totalCount] = await Promise.all([
		prisma.auditTrail.findMany({
			where: { recordId: { hasSome: recordIds } },
			orderBy: { timestamp: 'desc' },
			skip,
			take: pageSize,
			select: {
				id: true,
				timestamp: true,
				actorId: true,
				operation: true,
				old: true,
				new: true,
				table: true,
			},
		}),
		prisma.auditTrail.count({ where: { recordId: { hasSome: recordIds } } }),
	])

	// Gather all unique user IDs from the 'old' and 'new' JSONB objects for a single lookup
	const allUserIdsInDiff = new Set<string>()
	auditTrailRecords.forEach((record) => {
		const oldData = record.old as Record<string, JsonValue>
		const newData = record.new as Record<string, JsonValue>
		if (typeof oldData?.userId === 'string') {
			allUserIdsInDiff.add(oldData.userId)
		}
		if (typeof newData?.userId === 'string') {
			allUserIdsInDiff.add(newData.userId)
		}
	})
	// Actors (the "User" column) are a separate lookup from the userId-within-diff one above - actorId isn't
	// a formal Prisma relation on AuditTrail (it has to survive the actor's own User row being deleted), so
	// there's no join to pull this from directly.
	auditTrailRecords.forEach((record) => allUserIdsInDiff.add(record.actorId))

	const usersInDiff = await prisma.user.findMany({
		where: {
			id: { in: Array.from(allUserIdsInDiff) },
		},
		select: {
			id: true,
			name: true,
		},
	})

	const userLookupMap = new Map<string, string>()
	usersInDiff.forEach((user) => {
		if (user.name) {
			userLookupMap.set(user.id, user.name)
		}
	})

	// Define a mapping of technical field names to user-friendly labels.
	const userFriendlyLabels: Record<string, string> = {
		geo: 'Geographic Data',
		geoWKT: 'Well-Known Text',
		geoJSON: 'Geographic JSON',
		latitude: 'Latitude',
		longitude: 'Longitude',
		postCode: 'Postal Code',
		addressVisibility: 'Address Visibility',
		updatedAt: 'Last Updated',
		serviceId: 'Service',
		data: 'Data',
		// Add other mappings as needed
	}

	// Helper function to generate a human-readable string for a change
	const getHumanReadableSummary = (
		key: string,
		oldValue: JsonValue | undefined,
		newValue: JsonValue | undefined
	) => {
		const label = userFriendlyLabels[key] || key
		const normalizedOldValue = oldValue === undefined ? null : oldValue
		const normalizedNewValue = newValue === undefined ? null : newValue

		if (normalizedOldValue === null && normalizedNewValue !== null) {
			return `${label} was added: ${JSON.stringify(normalizedNewValue)}`
		} else if (normalizedNewValue === null && normalizedOldValue !== null) {
			return `${label} was removed (previously ${JSON.stringify(normalizedOldValue)})`
		} else if (key.includes('geo') || key === 'data') {
			return `${label} was updated.`
		} else {
			return `${label} was changed from "${JSON.stringify(normalizedOldValue)}" to "${JSON.stringify(normalizedNewValue)}".`
		}
	}

	// Process the raw results to match the desired output format.
	const formattedResults = auditTrailRecords.map((record) => {
		const details: Record<string, string> = {}
		const summary: string[] = []
		const oldData =
			record.old && typeof record.old === 'object' && !Array.isArray(record.old)
				? (record.old as Record<string, JsonValue>)
				: {}
		const newData =
			record.new && typeof record.new === 'object' && !Array.isArray(record.new)
				? (record.new as Record<string, JsonValue>)
				: {}

		// The audit trigger's `operation` column is actually 'INSERT'/'UPDATE'/'DELETE' (see the
		// AuditTrailOperation enum) - this previously checked for 'CREATE', which never matches, so every
		// newly-created record fell through to the generic per-field diff below (comparing against an empty
		// `old`) instead of this simplified message, and deletions were entirely excluded further upstream by
		// the old query (`AND "new" IS NOT NULL`) and so never reached this point at all.
		if (record.operation === 'INSERT') {
			const recordName =
				(newData.name as string) || (newData.title as string) || (newData.id as string) || 'a new record'
			summary.push(`New ${record.table} record was created: "${recordName}"`)
		} else if (record.operation === 'DELETE') {
			const recordName =
				(oldData.name as string) || (oldData.title as string) || (oldData.id as string) || 'a record'
			summary.push(`${record.table} record was deleted: "${recordName}"`)
		} else {
			// Only include fields that have changed for UPDATE operations
			const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)])
			allKeys.forEach((key) => {
				const oldValue = oldData[key]
				const newValue = newData[key]
				const normalizedOldValue = oldValue === undefined ? null : oldValue
				const normalizedNewValue = newValue === undefined ? null : newValue

				if (normalizedOldValue !== normalizedNewValue) {
					let displayOldValue = String(normalizedOldValue)
					let displayNewValue = String(normalizedNewValue)

					if (key === 'userId') {
						displayOldValue = userLookupMap.get(displayOldValue) || displayOldValue
						displayNewValue = userLookupMap.get(displayNewValue) || displayNewValue
					}

					details[key] = `${displayOldValue} → ${displayNewValue}`
					summary.push(getHumanReadableSummary(key, oldValue, newValue))
				}
			})
		}

		return {
			id: record.id,
			timestamp: record.timestamp.toISOString(),
			actorId: record.actorId,
			operation: record.operation,
			// The new recordId property, extracted from the 'new' payload (falls back to 'old' for a DELETE,
			// where 'new' is always null)
			recordId: (newData.id as string) || (oldData.id as string) || null,
			user: {
				name: userLookupMap.get(record.actorId) ?? null,
			},
			table: record.table,
			details,
			summary,
		}
	})

	return {
		results: formattedResults,
		totalCount,
	}
}

export default getAllForOrg
