/* eslint-disable @typescript-eslint/no-explicit-any */
import compact from 'just-compact'
import omit from 'just-omit'
import pick from 'just-pick'
import invariant from 'tiny-invariant'

import { auditLogLinkAction, CreateAuditLog, GenerateAuditLog } from './create/auditLog'

/**
 * `*************`
 *
 * Prisma nesting helpers
 *
 * `*************`
 */
/** Array to a createMany object */

export const createManyRequired = <T extends Array<any>>(data: T) => {
	invariant(data)
	return {
		createMany: {
			data: compact(data),
			skipDuplicates: true,
		},
	}
}
/** Array to createMany object or `undefined` if no data provided */

export const createManyOptional = <T extends Array<any>>(data: T | undefined) =>
	!data || data.length === 0
		? undefined
		: {
				createMany: {
					data: compact(data),
					skipDuplicates: true,
				},
		  }
/** Array to individual nested create records with individual Audit Logs */

export const createManyWithAudit = <T extends Array<any>>(data: T | undefined, actorId: string) =>
	!data
		? undefined
		: ({
				create: compact(data).map((record) => ({
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
export const connectOneId = <T extends string>(id: T | undefined | null) =>
	!id ? undefined : ({ connect: { id } } as const)
export const connectOneIdRequired = <T extends string>(id: T) => {
	invariant(id)
	return { connect: { id } }
}
export const connectOrDisconnectId = <T extends string | null | undefined>(id: T) => {
	switch (id) {
		case null: {
			return { disconnect: true }
		}
		case undefined: {
			return
		}
		default: {
			if (typeof id === 'string') return { connect: { id } }
		}
	}
}

export const diffConnections = <T extends Record<string, any>>(current: T[], prev: T[], idField: keyof T) => {
	const connect = current.filter((record) => {
		const id = record[idField]
		invariant(id)
		return prev.every((prevRecord) => prevRecord[idField] !== id)
	})
	const disconnect = prev.filter((record) => {
		const id = record[idField]
		invariant(id)
		return current.every((currRecord) => currRecord[idField] !== id)
	})
	return {
		connect: connect.length ? current : undefined,
		disconnect: disconnect.length ? disconnect : undefined,
	}
}
export const diffConnectionsMtoN = <T extends Record<string, any>>(
	current: T[],
	prev: T[],
	idField: keyof T
) => {
	const creations = current.filter((record) => {
		const id = record[idField]
		invariant(id)
		return !prev.some((prevRecord) => prevRecord[idField] === id)
	})
	const deletions = prev.filter((record) => {
		const id = record[idField]
		invariant(id)
		return !current.some((currRecord) => currRecord[idField] === id)
	})
	return {
		createMany: creations.length ? { data: creations, skipDuplicates: true } : undefined,
		deleteMany: deletions.length ? deletions : undefined,
	}
}
export const connectOneRequired = <T extends Record<string, any>>(data: T) => {
	invariant(data)
	return {
		connect: data,
	}
}
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

export const createOneSeparateLog = <T extends object>(
	data: T | undefined,
	actorId: string,
	opts?: LinkManyOptions<T>
) => {
	if (!data) return [undefined, undefined] as const
	const links = {
		create: data,
	}

	const to = opts?.auditDataKeys ? pick(data, opts.auditDataKeys) : auditLogLinkAction
	const linkIds = opts?.auditDataKeys ? omit(data, opts.auditDataKeys) : data
	const log = GenerateAuditLog({
		actorId,
		operation: 'LINK',
		to,
		...linkIds,
	})

	return [links, log] as const
}

export const deleteOneSeparateLog = <T extends object>(data: T | undefined, actorId: string) => {
	if (!data) return [undefined, undefined] as const
	const links = {
		delete: data,
	}

	const log = GenerateAuditLog({
		actorId,
		operation: 'UNLINK',
		to: data,
	})

	return [links, log] as const
}
