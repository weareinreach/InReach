import { MultiSelect, type MultiSelectProps, Text } from '@mantine/core'
import { useCallback, useMemo } from 'react'

export interface GroupedMultiSelectOption {
	id: string
	label: string
}

export interface GroupedMultiSelectGroup extends GroupedMultiSelectOption {
	items: GroupedMultiSelectOption[]
	/**
	 * Adds an "All {label}" row at the top of this group (only when it has more than one item) that
	 * selects/deselects every item in the group at once - matching how a "select all" control behaves
	 * everywhere else in the app (the org-edit Community Focus picker, the public search's "All [Category]"
	 * service checkbox): it's a pure bulk-toggle, and the group's own id is never itself part of the submitted
	 * value. A cascadable group also skips Mantine's own native group-header row entirely
	 *
	 * - The "All X" row already names the group, so a second, non-interactive header repeating the same name
	 *   right above it is pure redundancy (and was the main source of the "hard to understand" report this
	 *   component was rewritten for). Omit for a group that's only ever a plain visual grouping with no "select
	 *   all" precedent anywhere in the app (e.g. Service Attributes), which keeps its native header.
	 */
	cascadable?: boolean
}

export interface GroupedMultiSelectProps {
	/**
	 * Not rendered visibly - this control is meant to sit inside a `FilterChip`, which already shows the label
	 * on its collapsed chip. Used only as the input's `aria-label`.
	 */
	label: string
	placeholder?: string
	/**
	 * `undefined` groups render as ungrouped flat options (e.g. Remote Options, which has nothing to group by)
	 *
	 * - Mantine's combobox data accepts plain items and `{group, items}` entries in the same list.
	 */
	groups: GroupedMultiSelectGroup[] | undefined
	value: string[]
	onChange: (value: string[]) => void
	isLoading?: boolean
	width?: number
}

// The app-wide Input/InputWrapper theme defaults hardcode a real `height: 48px` on every input regardless
// of `size` (theme/components/Input.module.css) - `minHeight` alone never wins against an already-larger
// fixed `height` from another source, so `height: 'auto'` is needed to hand control back to the content.
// Exported so every compact toolbar MultiSelect (this component's five filters, plus the toolbar's own
// Status filter in OrganizationTable.tsx) shares one literal style object instead of each keeping its own
// hand-copied version that can quietly drift out of sync with the others.
export const COMPACT_MULTISELECT_STYLES = {
	input: { height: 'auto', minHeight: 30, fontSize: 'var(--mantine-font-size-xs)', padding: '2px 8px' },
	label: { fontSize: 'var(--mantine-font-size-xs)' },
	// `Pill` defaults its own `size` to 'sm' regardless of the MultiSelect's `size='xs'` - it doesn't
	// inherit automatically, so without this override its text renders visibly larger than everything else
	// in the widget.
	pill: { fontSize: 'var(--mantine-font-size-xs)' },
	// Mantine's clear/chevron section spans the full input height and centers itself within it - once
	// wrapped pills make the input taller than one line, that centering drops it into whatever empty space
	// is left partway down, looking like a stray extra pill. Pinning it to the top keeps it level with the
	// first row instead.
	section: { alignItems: 'flex-start' as const, paddingTop: 6 },
}

const ALL_ROW_PREFIX = '__all__:'
const allRowId = (groupId: string) => `${ALL_ROW_PREFIX}${groupId}`
const isAllRow = (id: string) => id.startsWith(ALL_ROW_PREFIX)
const groupIdFromAllRow = (id: string) => id.slice(ALL_ROW_PREFIX.length)

/**
 * 'all' = a cascadable group's synthetic "All X" row. 'child' = a real item nested under a group (visible
 * either as a plain sub-item under a cascadable group's "All X" row, or under a non-cascadable group's own
 * native Mantine header). 'flat' = a real, standalone item with no parent context at all (a childless
 * top-level attribute, a cascadable group collapsed to its single item, or an ungrouped option like Remote
 * Options).
 */
type OptionRole = 'all' | 'child' | 'flat'

/**
 * A standard, compact `MultiSelect` - checkbox-free rows, same styling as Status/Create Method - with one
 * addition: a group marked `cascadable` gets a synthetic "All {group}" row that selects/deselects every item
 * in that group at once, without ever becoming part of the real, submitted value itself (see
 * `GroupedMultiSelectGroup.cascadable`). Shared by the Organization table's Community, Leader Badge, Service
 * Tags, Service Attributes, and Remote Options quick filters.
 */
export const GroupedMultiSelect = ({
	label,
	placeholder = 'All',
	groups,
	value,
	onChange,
	isLoading,
	width = 220,
}: GroupedMultiSelectProps) => {
	const { data, optionRoles } = useMemo(() => {
		// Mantine requires every option's `value` to be unique across the *entire* flat data array, not
		// just within its own group - but an attribute/tag can legitimately belong to more than one
		// category (Community/Leader Badge attributes can nest under multiple parents; Service Tags and
		// Service Attributes can both attach to multiple categories). Without deduplication, a shared item
		// crashes the whole MultiSelect ("Duplicate options are not supported"). It stays visible under
		// whichever group it's encountered in first; later repeats are just omitted from the dropdown - the
		// cascade/match-mode logic below still treats it as belonging to every group it actually has, since
		// that reads from the original `groups` prop, not this deduplicated list.
		const seenIds = new Set<string>()
		const roles = new Map<string, OptionRole>()
		// `MultiSelectProps['data']` itself is a readonly array type - build up a plain mutable one and only
		// hand it off as that type once finished, rather than fighting `.push()` against readonly the whole way.
		const result: (
			{ value: string; label: string } | { group: string; items: { value: string; label: string }[] }
		)[] = []
		for (const group of groups ?? []) {
			if (group.cascadable) {
				if (group.items.length > 1) {
					const id = allRowId(group.id)
					roles.set(id, 'all')
					result.push({ value: id, label: `All ${group.label}` })
					for (const item of group.items) {
						if (seenIds.has(item.id)) continue
						seenIds.add(item.id)
						roles.set(item.id, 'child')
						result.push({ value: item.id, label: item.label })
					}
				} else {
					// A single-item cascadable group has no "All X" row to act as its header, so there's
					// nothing left to indent the lone item under - show it plain, same as a childless item.
					for (const item of group.items) {
						if (seenIds.has(item.id)) continue
						seenIds.add(item.id)
						roles.set(item.id, 'flat')
						result.push({ value: item.id, label: item.label })
					}
				}
				continue
			}
			const items = group.items.filter((item) => {
				if (seenIds.has(item.id)) return false
				seenIds.add(item.id)
				return true
			})
			if (!items.length) {
				continue
			}
			if (!group.label) {
				for (const item of items) {
					roles.set(item.id, 'flat')
				}
				result.push(...items.map((item) => ({ value: item.id, label: item.label })))
				continue
			}
			for (const item of items) {
				roles.set(item.id, 'child')
			}
			result.push({ group: group.label, items: items.map((item) => ({ value: item.id, label: item.label })) })
		}
		return { data: result, optionRoles: roles }
	}, [groups])

	const renderOption = useCallback<NonNullable<MultiSelectProps['renderOption']>>(
		({ option }) => {
			const isChild = optionRoles.get(option.value) === 'child'
			return (
				<Text size='xs' fs={isChild ? 'italic' : undefined} pl={isChild ? 16 : 0}>
					{option.label}
				</Text>
			)
		},
		[optionRoles]
	)

	// The MultiSelect's own displayed value includes a cascadable group's synthetic "All X" id whenever
	// every one of that group's real items is already selected, so it shows checked - even though that
	// synthetic id is never part of `value` itself (the actual, submitted filter state).
	const displayValue = useMemo(() => {
		const allRows = (groups ?? [])
			.filter(
				(group) =>
					group.cascadable && group.items.length > 1 && group.items.every((item) => value.includes(item.id))
			)
			.map((group) => allRowId(group.id))
		return [...value, ...allRows]
	}, [groups, value])

	const handleChange = useCallback(
		(next: string[]) => {
			const addedAllRows = next.filter((id) => isAllRow(id) && !displayValue.includes(id))
			const removedAllRows = displayValue.filter((id) => isAllRow(id) && !next.includes(id))
			let realNext = next.filter((id) => !isAllRow(id))
			for (const rowId of addedAllRows) {
				const group = (groups ?? []).find((g) => g.id === groupIdFromAllRow(rowId))
				if (group) {
					realNext = [...new Set([...realNext, ...group.items.map((item) => item.id)])]
				}
			}
			for (const rowId of removedAllRows) {
				const group = (groups ?? []).find((g) => g.id === groupIdFromAllRow(rowId))
				if (group) {
					const childIds = new Set(group.items.map((item) => item.id))
					realNext = realNext.filter((id) => !childIds.has(id))
				}
			}
			onChange(realNext)
		},
		[groups, displayValue, onChange]
	)

	return (
		<MultiSelect
			size='xs'
			aria-label={label}
			placeholder={placeholder}
			styles={COMPACT_MULTISELECT_STYLES}
			data={data}
			value={displayValue}
			onChange={handleChange}
			renderOption={renderOption}
			disabled={isLoading}
			searchable
			clearable
			w={width}
			comboboxProps={{ withinPortal: false }}
		/>
	)
}
