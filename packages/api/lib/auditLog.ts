import { Prisma, PrismaClient, prisma, AuditLog } from '@weareinreach/db'
import { z } from 'zod'

import { InputJsonValueType } from 'schemas/common'

import { PrismaTables, AuditLogSchema, prismaQueries, QueryParams } from '../schemas/auditLog'

export const auditLog: AuditLogParser = async (table, method, data) => {
	const parser = AuditLogSchema[table]

	return parser.parse(data)
}

type AuditLogParser = <T extends Readonly<PrismaTables>, M extends Method>(
	table: T extends Readonly<PrismaTables> ? T : never,
	method: M,
	data: ZodData<T>
) => Promise<AuditLogReturn<T>>

type Method = CreateMethod | UpdateMethod

type CreateMethod = 'create' | 'link'
type UpdateMethod = 'update' | 'delete' | 'unlink'
type ZodData<T extends Readonly<PrismaTables>> = z.input<(typeof AuditLogSchema)[T]>

type AuditLogReturn<T extends Readonly<PrismaTables>> = z.output<(typeof AuditLogSchema)[T]>

type DataProp<T extends Readonly<PrismaTables>, M extends Method> = M extends CreateMethod
	? Omit<ZodData<T>, 'from'> & Partial<Pick<ZodData<T>, 'from'>>
	: ZodData<T>
