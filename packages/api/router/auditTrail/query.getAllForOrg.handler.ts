import { type JsonValue } from 'type-fest'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetAllForOrgSchema } from './query.getAllForOrg.schema'

// Define the type for the raw SQL query result.
interface AuditTrailRawResult {
	id: string
	timestamp: Date
	actorId: string
	operation: string
	old: JsonValue | null
	new: JsonValue | null
	'user.name': string | null
	table: string | null
}

const getAllForOrg = async ({ input }: TRPCHandlerParams<TGetAllForOrgSchema, 'protected'>) => {
	console.log('Input received:', input)
	const { slug, page, pageSize } = input

	// Add a check to confirm the Prisma client is available
	if (!prisma) {
		console.error('Prisma client is not initialized. Check your @weareinreach/db configuration.')
		throw new Error('Database client not ready.')
	}

	// Calculate the offset for pagination
	const skip = (page - 1) * pageSize

	try {
		// 1. First, find the organization ID using the provided slug.
		const organization = await prisma.organization.findUnique({
			where: { id: slug },
			select: { id: true },
		})

		// If no organization is found for the slug, return an an empty array.
		if (!organization) {
			console.log('No organization found for slug:', slug)
			return {
				results: [],
				totalCount: 0,
			}
		}

		const organizationId = organization.id
		console.log('Found organization ID:', organizationId)

		// 2. Fetch all audit trail records related to this organization, with pagination.
		const auditTrailRecords = await prisma.$queryRaw<AuditTrailRawResult[]>`
      SELECT
        at."id",
        at."timestamp",
        at."actorId",
        at."operation",
        at."old",
        at."new",
        at."table",
        "User"."name" AS "user.name"
      FROM
        "AuditTrail" AS at
      LEFT JOIN
        "User" ON at."actorId" = "User"."id"
      WHERE
        COALESCE(
          JSONB_EXTRACT_PATH_TEXT(at."new", 'organizationId'),
          JSONB_EXTRACT_PATH_TEXT(at."new", 'orgId'),
          JSONB_EXTRACT_PATH_TEXT(at."new", 'organization_id')
        ) = ${organizationId}
        AND at."new" IS NOT NULL
      ORDER BY
        at."timestamp" DESC
      LIMIT ${pageSize}
      OFFSET ${skip};
    `

		// 3. Get the total count of records for pagination
		const totalCountResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT
        COUNT(at."id")
      FROM
        "AuditTrail" AS at
      WHERE
        COALESCE(
          JSONB_EXTRACT_PATH_TEXT(at."new", 'organizationId'),
          JSONB_EXTRACT_PATH_TEXT(at."new", 'orgId'),
          JSONB_EXTRACT_PATH_TEXT(at."new", 'organization_id')
        ) = ${organizationId}
        AND at."new" IS NOT NULL;
    `
		const totalCount = Number(totalCountResult[0]?.count || 0)

		// Gather all unique user IDs from the 'old' and 'new' JSONB objects for a single lookup
		const allUserIdsInDiff = new Set<string>()
		auditTrailRecords.forEach((record) => {
			const oldData = record.old as Record<string, JsonValue>
			const newData = record.new as Record<string, JsonValue>
			// Use optional chaining for a more concise check
			if (typeof oldData?.userId === 'string') {
				allUserIdsInDiff.add(oldData.userId)
			}
			if (typeof newData?.userId === 'string') {
				allUserIdsInDiff.add(newData.userId)
			}
		})

		// Fetch all user names in a single batch for efficiency
		const usersInDiff = await prisma.user.findMany({
			where: {
				id: { in: Array.from(allUserIdsInDiff) },
			},
			select: {
				id: true,
				name: true,
			},
		})

		// Create maps for quick lookups
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

		// 4. Process the raw results to match the desired output format.
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

			// Check if the record is a new creation. If so, provide a simplified message.
			if (record.operation === 'CREATE') {
				const recordName =
					(newData.name as string) || (newData.title as string) || (newData.id as string) || 'a new record'
				summary.push(`New ${record.table} record was created: "${recordName}"`)
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
				// The new recordId property, extracted from the 'new' payload
				recordId: (newData.id as string) || null,
				user: {
					name: record['user.name'],
				},
				table: record.table,
				// Use property shorthand
				details,
				summary,
			}
		})

		return {
			results: formattedResults,
			totalCount,
		}
	} catch (error) {
		console.error('An error occurred during the audit trail query:', error)
		throw error // Re-throw the error so tRPC can handle it
	}
}

export default getAllForOrg
