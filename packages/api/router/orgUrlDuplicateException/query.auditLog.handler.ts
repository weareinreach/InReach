import { type Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAuditLogSchema } from './query.auditLog.schema'

const FIELD_LABELS: Record<string, string> = {
	baseUrl: 'Base URL',
	description: 'Description',
	active: 'Active',
}

const summarizeChange = (key: string, oldValue: unknown, newValue: unknown) => {
	const label = FIELD_LABELS[key] ?? key
	if (oldValue === undefined || oldValue === null) {
		return `${label} was set to "${String(newValue)}"`
	}
	if (newValue === undefined || newValue === null) {
		return `${label} was cleared`
	}
	return `${label} changed from "${String(oldValue)}" to "${String(newValue)}"`
}

/**
 * Activity log for a single base-URL exception - who created/edited/deleted/restored it and what changed,
 * each time. `AuditTrail` is populated by a Postgres trigger (enabled on this table specifically via
 * `audit_trail_enable` - not automatic), fed by `getAuditedClient`'s `app.actor_id` session variable set on
 * every mutating call in this router. Queries `table`/`recordId` directly rather than guessing at an
 * org-shaped foreign key inside the JSON diff (see `auditTrail.getAllForOrg`, which is
 * organization-specific).
 */
const auditLog = async ({ input }: TRPCHandlerParams<TAuditLogSchema, 'protected'>) => {
	const { id, page, pageSize } = input
	const where: Prisma.AuditTrailWhereInput = { table: 'OrgUrlDuplicateException', recordId: { has: id } }

	const [entries, total] = await Promise.all([
		prisma.auditTrail.findMany({
			where,
			orderBy: { timestamp: 'desc' },
			take: pageSize,
			skip: (page - 1) * pageSize,
		}),
		prisma.auditTrail.count({ where }),
	])

	const actorIds = [...new Set(entries.map((entry) => entry.actorId))]
	const actors = await prisma.user.findMany({
		where: { id: { in: actorIds } },
		select: { id: true, name: true, email: true },
	})
	const actorNameById = new Map(actors.map((actor) => [actor.id, actor.name ?? actor.email]))

	const results = entries.map((entry) => {
		const oldData = (entry.old ?? {}) as Record<string, unknown>
		const newData = (entry.new ?? {}) as Record<string, unknown>
		const summary: string[] = []

		if (entry.operation === 'INSERT') {
			summary.push(`Added, base URL "${String(newData.baseUrl)}"`)
		} else if (entry.operation === 'DELETE') {
			summary.push('Row removed')
		} else {
			const keys = new Set([...Object.keys(oldData), ...Object.keys(newData)])
			keys.delete('updatedAt')
			for (const key of keys) {
				if (oldData[key] !== newData[key]) {
					summary.push(summarizeChange(key, oldData[key], newData[key]))
				}
			}
		}

		return {
			id: entry.id,
			timestamp: entry.timestamp,
			operation: entry.operation,
			actorName: actorNameById.get(entry.actorId) ?? entry.actorId,
			summary,
		}
	})

	return { results, total }
}
export default auditLog
