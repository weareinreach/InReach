// Tri-state - a plain `Select` needs its own string values, unlike the `boolean | undefined` the rest of
// the app stores this filter as (a row's own `deleted` flag, ORG_SELECT's `deleted` field). 'all' is a
// real, selectable option here (unlike most other toolbar filters, whose "no filter" state is `clearable`
// back to nothing) since there's no other value to fall back on: leaving this dropdown blank would be
// ambiguous between "show all" and "hide deleted" (the actual default). Shared by the Organization table
// and Bulk Search & Replace, so both tables' Deleted filter looks and behaves identically.
export const DELETED_FILTER_OPTIONS = [
	{ value: 'hide', label: 'Hide deleted' },
	{ value: 'show', label: 'Show deleted only' },
	{ value: 'all', label: 'Show all' },
]

export const deletedFilterToValue = (state: boolean | undefined): string =>
	state === undefined ? 'all' : state ? 'show' : 'hide'

export const deletedValueToFilter = (value: string | null): boolean | undefined => {
	if (value === 'show') return true
	if (value === 'hide') return false
	return undefined
}

/** Shared tooltip content, one line per option - see FilterHelp.tsx's `helpLines`. */
export const DELETED_FILTER_HELP = [
	'Hide deleted: excludes deleted organizations (the default).',
	'Show deleted only: only deleted organizations.',
	'Show all: every organization, deleted or not.',
]
