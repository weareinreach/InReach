type ClassValue = string | undefined | null | false | Record<string, boolean | undefined>

/**
 * Minimal clsx-style class name joiner (string/falsy/`{className: boolean}` args), replacing the `cx` helper
 * `createStyles()` used to return alongside `classes`.
 */
export const cx = (...args: ClassValue[]): string =>
	args
		.flatMap((arg) => {
			if (!arg) {
				return []
			}
			if (typeof arg === 'string') {
				return [arg]
			}
			return Object.entries(arg)
				.filter(([, enabled]) => enabled)
				.map(([className]) => className)
		})
		.join(' ')
