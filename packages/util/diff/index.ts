/**
 * These functions are taken from
 * [`useful-typescript-functions`](https://www.npmjs.com/package/useful-typescript-functions). The package has
 * peerDeps that cause some issues with the Next.js build.
 *
 * Date added: 2024-02-12 Version: 4.0.7
 *
 * Files copied from: https://github.com/jschirrmacher/useful-typescript-functions/blob/main/src/Objects.ts
 * https://github.com/jschirrmacher/useful-typescript-functions/blob/main/src/types.ts
 */

/**
 * Creates a new array containing unique elements from both input arrays.
 *
 * @param {string[]} arr1 - The first array input
 * @param {string[]} arr2 - The second array input
 * @returns {string[]} A new array containing unique elements from both input arrays
 */
function union(arr1: string[], arr2: string[]) {
	return [...new Set([...arr1, ...arr2])]
}

/**
 * Creates a list of path - value pairs. The paths represent the nesting levels of the properties in the given
 * object.
 *
 * @param obj An object to be destructured to a list of properties and values
 * @returns List of paths with values in the given object
 */
export function arrayize(obj: BaseType | StringIndexableObject): Arrayized[] {
	const concat = (...parts: string[]) => parts.filter((x) => x).join('.')

	if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
		return Object.entries(obj as StringIndexableObject).flatMap(([key, value]) => {
			if (value === null) {
				return [[key, value]]
			}
			return arrayize(value).map((e) => [concat(key, e[0]), e[1]]) as Arrayized[]
		})
	}
	return [['', obj]]
}

/**
 * Flatten deeply nested objects to have new properties containing paths with "." as separator for nesting
 * levels.
 *
 * @param obj Original, deeply nested object
 * @returns Flat object of only one level, but with property names containing paths of the original object
 */
export function flatten(obj: BaseType | StringIndexableObject): StringIndexableObject {
	return Object.fromEntries(arrayize(obj))
}

/**
 * Inflate a flattened object (with paths as property names) to a deeply nested object
 *
 * @param obj Flattened object
 * @returns Re-inflated object, which may contain a nesting structure.
 */
export function inflate(obj: StringIndexableObject) {
	return Object.entries(obj).reduce((obj, [path, value]) => {
		const splitted = path.split('.')
		const last = splitted.pop() as string
		let pointer = obj
		splitted.forEach((p) => {
			if (!pointer[p]) {
				pointer[p] = {}
			}
			pointer = pointer[p] as StringIndexableObject
		})
		pointer[last] = value
		return obj
	}, {} as StringIndexableObject)
}

/**
 * Find the differences between two objects.
 *
 * @param from Original object
 * @param other Modified object
 * @param include Defines which values the result should include
 * @returns A new object containing only the properties which are modified with the original and the modified
 *   values.
 */
export function diff(
	from: StringIndexableObject,
	other: StringIndexableObject,
	include: 'from' | 'to' | 'both' = 'both'
) {
	const values1 = flatten(from)
	const values2 = flatten(other)

	const valueMapping = {
		from: (p: string) => [p, values1[p]],
		to: (p: string) => [p, values2[p]],
		both: (p: string) => [p, { from: values1[p], to: values2[p] }],
	}

	const changes = union(Object.keys(values1), Object.keys(values2))
		.filter((p) => values1[p] !== values2[p])
		.map((p) => valueMapping[include](p))

	return inflate(Object.fromEntries(changes))
}

/**
 * Checks if an object contains another one.
 *
 * @param object Object to compare
 * @param other Object which might be contained in first object
 * @returns True if the current object contains the other one.
 */
export function objectContains(object: StringIndexableObject, other: StringIndexableObject) {
	const flat1 = flatten(object)
	return arrayize(other).every(([key, value]) => flat1[key] === value)
}

export function objectContaining(contains: StringIndexableObject) {
	return {
		asymmetricMatch(obj: StringIndexableObject) {
			return objectContains(obj, contains)
		},
	}
}

/**
 * Rename an attribute in an object. This higher level function returns a mapper which can be used in an
 * `Array.map()` call. Example:
 *
 *     const mappedUsers = users.map(renameAttribute('name', 'firstName'))
 *
 * @param from Previous name of attribute
 * @param to New name of attribute
 * @returns (obj: Record<string, unknown>) => T
 */
export function renameAttribute<T extends object>(from: string, to: keyof T) {
	return (obj: Record<string, unknown>) => {
		const { [from]: value, ...others } = obj
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		return { ...others, [to]: value } as T
	}
}

/**
 * Returns an object containing allowed changes to an original object. It ignores both, attributes not
 * contained in the original object, and attributes not allowed to be changed.
 *
 * @param obj Object to mutate
 * @param attributes Attributes which are allowed to be mutated
 * @param changes An object with the attributes and values to change
 * @returns Object containing allowed changes to an original object
 */
export function getMutation<T>(obj: T, attributes: readonly (keyof T)[], changes: Partial<T>) {
	const actualChanges = attributes
		.filter((attribute) => changes[attribute] !== undefined && obj[attribute] !== changes[attribute])
		.map((attribute) => ({ [attribute]: changes[attribute] }))
	return Object.assign({}, ...actualChanges)
}

/**
 * Mutates an object. It ignores both, attributes not contained in the original object, and attributes not
 * allowed to be changed.
 *
 * @param obj Object to mutate
 * @param attributes Attributes which are allowed to be mutated
 * @param changes An object with the attributes and values to change
 * @returns The mutated object
 */
export function mutate<T>(obj: T, attributes: readonly (keyof T)[], changes: Partial<T>) {
	return { ...obj, ...getMutation(obj, attributes, changes) }
}

/**
 * Extract properties with values from an object.
 *
 * @param obj
 * @param props
 * @returns New object with the extracted properties with values
 */
export function extract<T extends object>(obj: T, props: (keyof T)[]) {
	return Object.fromEntries(props.map((prop) => [prop, obj[prop]]))
}

export function createObject<T extends StringIndexableObject>(
	obj: T,
	writableAttributes: Array<keyof T> = Object.getOwnPropertyNames(obj)
) {
	const data: T = obj || {}

	const base = {
		/**
		 * Find the differences to the given object.
		 *
		 * @param other Object
		 * @param include Defines which values the result should include
		 * @returns A new object containing only the properties which are modified with the original and the
		 *   modified values.
		 */
		diff(other: Partial<T>, include: 'from' | 'to' | 'both' = 'both') {
			return diff(data, other, include)
		},

		/**
		 * Checks if the current object contains another one.
		 *
		 * @param other Object to compare with
		 * @returns True if the current object contains the other one.
		 */
		contains(other: Partial<T>) {
			return objectContains(data, other)
		},

		/**
		 * Creates a list of path/value pairs out of the current object. The paths represent the nesting levels of
		 * the properties in the given object.
		 *
		 * @returns List of paths with values in the given object
		 */
		arrayize() {
			return arrayize(data)
		},

		/**
		 * Flatten the current object to have new properties containing paths with "." as separator for nesting
		 * levels.
		 *
		 * @returns Flat object of only one level, but with property names containing paths of the original object
		 */
		flatten() {
			return createObject(flatten(data))
		},

		/**
		 * Inflate a flattened object (with paths as property names) to a deeply nested object
		 *
		 * @returns Re-inflated object, which may contain a nesting structure.
		 */
		inflate() {
			return createObject(inflate(data))
		},

		/**
		 * Mutates the object. It ignores both, attributes not contained in the original object, and attributes
		 * not allowed to be changed.
		 *
		 * @param changes An object with the attributes and values to change
		 * @returns The mutated object
		 */
		mutate(changes: Partial<T>): T {
			const mutated = mutate(data, writableAttributes, changes)
			return createObject(mutated, writableAttributes)
		},

		/**
		 * Extract some properties of the object.
		 *
		 * @param props
		 * @returns A new object containing only the extracted properties and values.
		 */
		extract(props: (keyof T)[]) {
			return createObject(extract(data, props))
		},
	}

	return Object.setPrototypeOf(data, base)
}
export type BaseType = string | number | boolean | null | undefined | Date
export interface StringIndexableObject {
	[property: string]: BaseType | StringIndexableObject
}
export type Arrayized = [string, BaseType]
