/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import compact from 'just-compact'
import invariant from 'tiny-invariant'

const isString = (x: unknown): x is string => typeof x === 'string'

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
export const createOne = <T extends Record<string, any> | string, K extends string = 'id'>(
	data: T | null | undefined,
	key?: K
): undefined | { create: T extends string ? { [Key in K]: T } : T } => {
	if (!data) {
		return undefined
	}
	if (isString(data)) {
		return { create: { [key ?? 'id']: data } as T extends string ? { [Key in K]: T } : T }
	}
	return {
		create: data as T extends string ? { [Key in K]: T } : T,
	}
}

export const connectOne = <T extends Record<string, any> | string, K extends string = 'id'>(
	data: T | null | undefined,
	key?: K
): undefined | { connect: T extends string ? { [Key in K]: T } : T } => {
	if (!data) {
		return undefined
	}
	if (isString(data)) {
		return { connect: { [key ?? 'id']: data } as T extends string ? { [Key in K]: T } : T }
	}
	return {
		connect: data as T extends string ? { [Key in K]: T } : T,
	}
}
export const connectOneId = <T extends string>(id: T | undefined | null) =>
	!id ? undefined : ({ connect: { id } } as const)

export const connectOneIdRequired = <T extends string>(id: T) => {
	invariant(id)
	return { connect: { id } }
}
export const connectOrDisconnectId = <T extends string | null | undefined>(id: T) => {
	try {
		if (id === null) {
			return { disconnect: true }
		}
		if (id === undefined) {
			return undefined
		}
		invariant(id)
		return { connect: { id } }
	} catch {
		return undefined
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
export const connectOneRequired = <T extends Record<string, any> | string, K extends string = 'id'>(
	data: T,
	key: K = 'id' as K
) => {
	invariant(data)

	if (isString(data)) {
		return { connect: { [key]: data } as T extends string ? { [Key in K]: T } : T }
	}
	return {
		connect: data as T extends string ? { [Key in K]: T } : T,
	}
}

export const connectOrCreateOne = <T extends string, K extends string = 'id'>(
	id: T | undefined | null,
	key?: K
): { connectOrCreate: { where: { [Key in K]: T }; create: { [Key in K]: T } } } | undefined => {
	if (!id) {
		return undefined
	}
	const idObj = { [key ?? 'id']: id } as { [Key in K]: T }

	return {
		connectOrCreate: {
			where: idObj,
			create: idObj,
		},
	}
}
