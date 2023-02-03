import superjson from 'superjson'
import { z } from 'zod'

// import { prismaQueriesAlt } from './prismaQueryClients'
import { getSchema, PrismaTables, AuditLogSchema, SchemaKey, AuditIds, BaseSchema } from '../schemas/auditLog'

const operationMap = {
	create: 'CREATE',
	update: 'UPDATE',
	delete: 'DELETE',
	link: 'LINK',
	unlink: 'UNLINK',
} as const

export const auditLog = <
	D extends object,
	T extends SchemaKey = SchemaKey,
	M extends Operation = Operation,
	R extends AuditIds<T> = AuditIds<T>
>({
	table,
	operation,
	actorId,
	recordId,
	from = {},
	to,
}: {
	table: T
	operation: M
	actorId: string
	recordId?: R extends AuditIds<T> ? R : never
	from?: Partial<D>
	to: D
}): AuditLogReturn<T> => {
	const parser = operation === 'create' ? BaseSchema : getSchema(table)

	const operationValue = operationMap[operation]
	const logInput = {
		actorId,
		to: superjson.serialize(to),
		from: superjson.serialize(from),
		operation: operationValue,
		...recordId,
	}

	const newAuditLog = {
		// auditLogs: { create: parser.parse(logInput) },
		create: parser.parse(logInput),
	}

	return newAuditLog
}

type AuditLogParser = <D, T extends SchemaKey, M extends Operation>(
	table: T extends Readonly<PrismaTables> ? T : never,
	operation: M,
	data: D
) => Promise<AuditLogReturn<T>>

type Operation = CreateOperation | UpdateOperation

type CreateOperation = 'create' | 'link'
type UpdateOperation = 'update' | 'delete' | 'unlink'
type ZodData<T extends Readonly<PrismaTables>> = z.input<(typeof AuditLogSchema)[T]>

type AuditLogReturn<T extends Readonly<PrismaTables>> = {
	create: z.output<(typeof AuditLogSchema)[T]> | z.output<typeof BaseSchema>
}

type DataProp<T extends Readonly<PrismaTables>, M extends Operation> = M extends CreateOperation
	? Omit<ZodData<T>, 'from'> & Partial<Pick<ZodData<T>, 'from'>>
	: ZodData<T>
