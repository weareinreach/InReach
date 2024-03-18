/* eslint-disable @typescript-eslint/no-explicit-any */
import compact from 'just-compact'
import invariant from 'tiny-invariant'

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

/** Individual create record */
export const createOne = <T extends Record<string, any>>(data: T | undefined) =>
	!data
		? undefined
		: ({
				create: data,
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
