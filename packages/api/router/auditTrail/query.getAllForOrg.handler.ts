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
			if (oldData && oldData.userId && typeof oldData.userId === 'string') {
				allUserIdsInDiff.add(oldData.userId)
			}
			if (newData && newData.userId && typeof newData.userId === 'string') {
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

		// 4. Process the raw results to match the desired output format,
		// including a 'details' object and the table name.
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

			// Combine all unique keys from both old and new data to ensure we catch all changes (additions, updates, deletions)
			const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)])

			// Check if the record is a new creation. If so, provide a simplified message.
			if (record.operation === 'CREATE') {
				const recordName =
					(newData.name as string) || (newData.title as string) || (newData.id as string) || 'a new record'
				summary.push(`New ${record.table} record was created: "${recordName}"`)
			} else {
				// Only include fields that have changed for UPDATE operations
				allKeys.forEach((key) => {
					const oldValue = oldData[key]
					const newValue = newData[key]

					// Normalize undefined and null to be the same for comparison purposes
					const normalizedOldValue = oldValue === undefined ? null : oldValue
					const normalizedNewValue = newValue === undefined ? null : newValue

					// Only include fields where the normalized values are different
					if (normalizedOldValue !== normalizedNewValue) {
						let displayOldValue: string
						let displayNewValue: string

						// Explicitly convert old value to a string
						if (normalizedOldValue === null) {
							displayOldValue = 'null'
						} else if (typeof normalizedOldValue === 'object') {
							// Use JSON.stringify for objects to show their content
							displayOldValue = JSON.stringify(normalizedOldValue)
						} else {
							// Use String() for all other primitive types
							displayOldValue = String(normalizedOldValue)
						}

						// Explicitly convert new value to a string
						if (normalizedNewValue === null) {
							displayNewValue = 'null'
						} else if (typeof normalizedNewValue === 'object') {
							// Use JSON.stringify for objects to show their content
							displayNewValue = JSON.stringify(normalizedNewValue)
						} else {
							// Use String() for all other primitive types
							displayNewValue = String(normalizedNewValue)
						}

						// If the key is 'userId', use the lookup map to get the user's name
						if (key === 'userId') {
							// The display value for userId should be the name if found, otherwise the ID itself
							displayOldValue = userLookupMap.get(displayOldValue) || displayOldValue
							displayNewValue = userLookupMap.get(displayNewValue) || displayNewValue
						}

						// Add to the technical diff object
						details[key] = `${displayOldValue} → ${displayNewValue}`

						// --- Create the user-friendly string ---
						const label = userFriendlyLabels[key] || key // Use label or fallback to key

						let humanReadableString = ''

						if (normalizedOldValue === null && normalizedNewValue !== null) {
							humanReadableString = `${label} was added: ${displayNewValue}`
						} else if (normalizedNewValue === null && normalizedOldValue !== null) {
							humanReadableString = `${label} was removed (previously ${displayOldValue})`
						} else if (key.includes('geo') || key === 'data') {
							// Special handling for complex, unreadable fields
							humanReadableString = `${label} was updated.`
						} else {
							humanReadableString = `${label} was changed from "${displayOldValue}" to "${displayNewValue}".`
						}

						summary.push(humanReadableString)
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
				details: details,
				summary: summary, // New human-readable diff field
				user: {
					name: record['user.name'],
				},
				table: record.table,
			}
		})

		return {
			results: formattedResults,
			totalCount: totalCount,
		}
	} catch (error) {
		console.error('An error occurred during the audit trail query:', error)
		throw error // Re-throw the error so tRPC can handle it
	}
}

export default getAllForOrg
