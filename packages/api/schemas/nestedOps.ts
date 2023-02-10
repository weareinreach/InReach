import omit from 'just-omit'
import pick from 'just-pick'

import { auditLogLinkAction, CreateAuditLog, GenerateAuditLog } from './create/auditLog'

/**
 * `*************`
 *
 * Prisma nesting helpers
 *
 * `*************`
 */
/** Array to a createMany object */

export const createMany = <T extends Array<any>>(data: T) =>
	({
		createMany: {
			data,
			skipDuplicates: true,
		},
	} as const)
/** Array to createMany object or `undefined` if no data provided */

export const createManyOrUndefined = <T extends Array<any>>(data: T | undefined) =>
	!data
		? undefined
		: ({
				createMany: {
					data,
					skipDuplicates: true,
				},
		  } as const)
/** Array to individual nested create records with individual Audit Logs */

export const createManyWithAudit = <T extends Array<any>>(data: T | undefined, actorId: string) =>
	!data
		? undefined
		: ({
				create: data.map((record) => ({
					...record,
					auditLogs: CreateAuditLog({ actorId, operation: 'CREATE', to: record }),
				})),
		  } as const)
/** Individual create record */
export const createOne = <T extends Record<string, any>>(data: T | undefined) =>
	!data
		? undefined
		: ({
				create: data,
		  } as const)
/** Individual create record with audit log */

export const createOneWithAudit = <T extends Record<string, any>>(data: T | undefined, actorId: string) =>
	!data
		? undefined
		: ({
				create: {
					...data,
					auditLogs: CreateAuditLog({ actorId, operation: 'CREATE', to: data }),
				},
		  } as const)

export const connectOne = <T extends Record<string, any>>(data: T | undefined) =>
	!data
		? undefined
		: ({
				connect: data,
		  } as const)

export const connectOneRequired = <T extends Record<string, any>>(data: T) =>
	({
		connect: data,
	} as const)
type LinkManyOptions<T> = {
	auditDataKeys?: Array<keyof T extends string ? keyof T : never>
}
export const linkManyWithAudit = <T extends object>(
	data: T[] | undefined,
	actorId: string,
	opts?: LinkManyOptions<T>
) => {
	if (!data) return [undefined, []] as const
	const links = {
		createMany: {
			data,
			skipDuplicates: true,
		},
	}
	const logs = data.map((record) => {
		const to = opts?.auditDataKeys ? pick(record, opts.auditDataKeys) : auditLogLinkAction
		const linkIds = opts?.auditDataKeys ? omit(record, opts.auditDataKeys) : record
		const log = GenerateAuditLog({
			actorId,
			operation: 'LINK',
			to,
			...linkIds,
		})
		return log
	})

	return [links, logs] as const
}
