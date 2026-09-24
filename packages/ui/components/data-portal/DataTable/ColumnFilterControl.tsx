import { Checkbox, MultiSelect, Select, Stack, TextInput } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useDebouncedValue } from '@mantine/hooks'
import { keepPreviousData } from '@tanstack/react-query'
import { type ChangeEvent, useCallback, useMemo, useState } from 'react'

import { trpc as api } from '~ui/lib/trpcClient'

import { type DataTableFilter, type DataTableFilterValue } from './types'

export interface ColumnFilterControlProps {
	label: string
	filter: DataTableFilter
	value: DataTableFilterValue | undefined
	onChange: (value: DataTableFilterValue | undefined) => void
}

/**
 * Split out because it needs its own local staging state - `Date | undefined` pairs, which every other filter
 * type doesn't need, and hooks can't be called conditionally inside a `switch`.
 *
 * Committing (calling `onChange`, which triggers a refetch) on every keystroke of the range - i.e. as soon as
 * the _first_ day is clicked - closed/reflowed the popover before the second click could land, making it look
 * like the whole page had reset and the range picker was broken. Local state holds the in-progress pick (so
 * the calendar still shows the first day selected while browsing for the second) and only calls `onChange`
 * once both ends of the range are actually chosen.
 */
const DateRangeFilter = ({
	label,
	value,
	onChange,
}: {
	label: string
	value: DataTableFilterValue | undefined
	onChange: (value: DataTableFilterValue | undefined) => void
}) => {
	const [committedFrom, committedTo] = Array.isArray(value)
		? (value as [Date | undefined, Date | undefined])
		: [undefined, undefined]
	const [pending, setPending] = useState<[Date | null, Date | null]>([
		committedFrom ?? null,
		committedTo ?? null,
	])

	const handleRangeChange = useCallback(
		(next: [string | null, string | null]) => {
			// v9 `DatePickerInput` always reports the new value as a date string (`YYYY-MM-DD`),
			// even though `value` still accepts `Date` objects - convert back at this boundary so
			// the rest of the filter pipeline can keep working with `Date` throughout.
			const [nextFrom, nextTo] = next
			const fromDate = nextFrom ? new Date(nextFrom) : null
			const toDate = nextTo ? new Date(nextTo) : null
			setPending([fromDate, toDate])
			// Only commit (and trigger the table's refetch) once both ends of the range are
			// picked - clearing the whole thing out is fine to commit immediately too.
			if ((fromDate && toDate) || (!fromDate && !toDate)) {
				const hasValue = fromDate || toDate
				onChange(hasValue ? [fromDate ?? undefined, toDate ?? undefined] : undefined)
			}
		},
		[onChange]
	)

	return (
		<DatePickerInput
			type='range'
			label={label}
			placeholder='Pick date range'
			numberOfColumns={2}
			// Never auto-close on selection - with `allowSingleDateInRange` (needed so a from===to
			// single-day range is pickable at all), Mantine treats one click as a "complete" range
			// and closes immediately, before a second, later day can be picked for an actual range.
			closeOnChange={false}
			allowSingleDateInRange
			// This calendar is itself nested inside the *outer* filter `Popover` (DataTable/index.tsx).
			// By default this dropdown portals to `document.body`, landing outside that outer
			// Popover's DOM subtree - so clicking a day registered as an "outside click" on the outer
			// Popover and closed the whole filter UI after a single click, before a range could be
			// completed. Rendering inline (no portal) keeps it a real descendant of the outer
			// Popover.Dropdown, so its own outside-click detection no longer misfires on this.
			popoverProps={{ withinPortal: false }}
			value={pending}
			onChange={handleRangeChange}
			clearable
			size='xs'
		/>
	)
}

/**
 * Multi-select type-ahead against `user.searchTypeahead` - type a name or email, pick one or more matches.
 * Each committed entry keeps both the user's id (what actually filters) and a display label, so a
 * previously-picked user stays visible/checked even once the dropdown's own result list - which depends on
 * the current search text - no longer contains them.
 */
const EMPTY_SELECTED: { id: string; label: string }[] = []

// Every filter control in this file (plain `select`/`multi-select` options and the async user-search
// MultiSelect alike) gets the same fixed width - without one, a `Select`/`MultiSelect` with no explicit
// width sizes to its own content inside the Popover.Dropdown (which itself just shrinks/grows to fit),
// so longer option labels (e.g. "In Progress", "Unaffirming") or several picked pills got clipped instead
// of the box just being comfortably wide enough to read.
const FILTER_INPUT_WIDTH = 240

// Without a fixed width, a MultiSelect (and the Popover.Dropdown wrapping it, which otherwise sizes to its
// content) just kept growing wider as more values were picked - each pill sat on one line rather than
// wrapping, so the whole filter popover crept sideways with every selection. `height: 'auto'` (overriding
// the app-wide Input theme default that hardcodes `height: 48px` on every input, same override
// OrganizationTable's own compact MultiSelects need) lets pills wrap onto their own lines instead within
// `FILTER_INPUT_WIDTH`; `maxHeight`/`overflowY` cap how tall that can grow before it scrolls, for someone
// who picks a long list of values.
const COMPACT_MULTISELECT_WRAP_STYLES = {
	input: {
		height: 'auto',
		minHeight: 30,
		maxHeight: 120,
		overflowY: 'auto' as const,
		fontSize: 'var(--mantine-font-size-xs)',
	},
	label: { fontSize: 'var(--mantine-font-size-xs)' },
	pill: { fontSize: 'var(--mantine-font-size-xs)' },
	// Mantine's clear/chevron section is absolutely positioned to span the *entire* input top-to-bottom and
	// centers itself within that span - fine for a single-line input, but once pills wrap onto a second or
	// third line (making the input taller than one line), centering within the full height drops it into
	// whatever empty space is left in the middle, looking like a stray extra pill floating in the box.
	// Pinning it to the top instead keeps it level with the first row of pills, where it reads as a control
	// on the input, not a mystery item among the selections.
	section: { alignItems: 'flex-start' as const, paddingTop: 6 },
}

const UserSearchFilter = ({
	label,
	value,
	onChange,
}: {
	label: string
	value: DataTableFilterValue | undefined
	onChange: (value: DataTableFilterValue | undefined) => void
}) => {
	// A stable empty-array fallback (rather than a fresh `[]` literal per render) so `selected`'s identity
	// only changes when the underlying filter value actually does - otherwise the `options` useMemo below
	// would see a "changed" dependency and recompute on every render whenever no user is selected.
	const selected = Array.isArray(value) ? (value as { id: string; label: string }[]) : EMPTY_SELECTED
	const [search, setSearch] = useState('')
	const [debouncedSearch] = useDebouncedValue(search, 300)
	const trimmedSearch = debouncedSearch.trim()

	const { data } = api.user.searchTypeahead.useQuery(
		{ search: trimmedSearch },
		{ enabled: trimmedSearch.length >= 2, placeholderData: keepPreviousData }
	)

	const options = useMemo(() => {
		const matches = (data ?? []).map((user) => ({
			value: user.id,
			label: user.name ? `${user.name} (${user.email})` : user.email,
		}))
		// Keeps every already-selected user selectable/checked even once their name/email no longer
		// matches whatever's since been typed into the search box.
		for (const person of selected) {
			if (!matches.some((option) => option.value === person.id)) {
				matches.unshift({ value: person.id, label: person.label })
			}
		}
		return matches
	}, [data, selected])

	const handleChange = useCallback(
		(nextIds: string[]) => {
			if (!nextIds.length) {
				onChange(undefined)
				return
			}
			// `options` always contains every currently-selected id (see the unshift above), so this never
			// silently drops a still-selected entry just because it fell out of the latest search results.
			const next = nextIds
				.map((id) => options.find((option) => option.value === id))
				.filter((option): option is { value: string; label: string } => Boolean(option))
				.map((option) => ({ id: option.value, label: option.label }))
			onChange(next)
			setSearch('')
		},
		[onChange, options]
	)

	return (
		<MultiSelect
			label={label}
			placeholder='Search by name or email'
			data={options}
			value={selected.map((person) => person.id)}
			searchable
			searchValue={search}
			onSearchChange={setSearch}
			onChange={handleChange}
			clearable
			size='xs'
			w={280}
			styles={COMPACT_MULTISELECT_WRAP_STYLES}
			nothingFoundMessage={trimmedSearch.length < 2 ? 'Type at least 2 characters' : 'No users found'}
			// Same fix as DateRangeFilter above, same reason: this MultiSelect's own dropdown is itself
			// nested inside the *outer* filter Popover. By default it portals to document.body, landing
			// outside that outer Popover's DOM subtree - so clicking an option registered as an "outside
			// click" on the outer Popover and could close the whole filter UI before the click's own
			// selection handler finished running, intermittently dropping the click depending on timing.
			// Rendering inline (no portal) keeps it a real descendant of the outer Popover.Dropdown.
			comboboxProps={{ withinPortal: false }}
		/>
	)
}

/** Renders the appropriate filter input for a column's declared `filter.type`, inside a `Popover.Dropdown`. */
export const ColumnFilterControl = ({ label, filter, value, onChange }: ColumnFilterControlProps) => {
	const handleTextChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => onChange(event.currentTarget.value || undefined),
		[onChange]
	)
	const handleTrueCheckboxChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => onChange(event.currentTarget.checked ? true : undefined),
		[onChange]
	)
	const handleFalseCheckboxChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => onChange(event.currentTarget.checked ? false : undefined),
		[onChange]
	)
	const handleSelectChange = useCallback((next: string | null) => onChange(next ?? undefined), [onChange])
	const handleMultiSelectChange = useCallback(
		(next: string[]) => onChange(next.length ? next : undefined),
		[onChange]
	)

	switch (filter.type) {
		case 'text': {
			return (
				<TextInput
					label={label}
					placeholder={`Filter by ${label.toLowerCase()}`}
					value={typeof value === 'string' ? value : ''}
					onChange={handleTextChange}
					size='xs'
				/>
			)
		}
		case 'checkbox': {
			const { trueLabel = label, falseLabel = `Not ${label.toLowerCase()}` } = filter
			return (
				<Stack gap={4}>
					<Checkbox
						label={trueLabel}
						checked={value === true}
						onChange={handleTrueCheckboxChange}
						size='xs'
					/>
					<Checkbox
						label={falseLabel}
						checked={value === false}
						onChange={handleFalseCheckboxChange}
						size='xs'
					/>
				</Stack>
			)
		}
		case 'select': {
			return (
				<Select
					label={label}
					data={filter.options}
					value={typeof value === 'string' ? value : null}
					onChange={handleSelectChange}
					clearable
					size='xs'
					w={FILTER_INPUT_WIDTH}
					// Same fix as DateRangeFilter/UserSearchFilter above, same reason: this Select's own
					// dropdown is nested inside the *outer* filter Popover and by default portals to
					// document.body, landing outside that Popover's DOM subtree - so clicking an option
					// registered as an "outside click" on the outer Popover and could close the whole filter
					// UI before the click's own selection handler finished running, intermittently dropping
					// the click depending on timing.
					comboboxProps={{ withinPortal: false }}
				/>
			)
		}
		case 'multi-select': {
			return (
				<MultiSelect
					label={label}
					data={filter.options}
					value={Array.isArray(value) ? (value as string[]) : []}
					onChange={handleMultiSelectChange}
					clearable
					size='xs'
					w={FILTER_INPUT_WIDTH}
					styles={COMPACT_MULTISELECT_WRAP_STYLES}
					// Same portal fix as the 'select' case above.
					comboboxProps={{ withinPortal: false }}
				/>
			)
		}
		case 'date-range': {
			return <DateRangeFilter label={label} value={value} onChange={onChange} />
		}
		case 'user-search': {
			return <UserSearchFilter label={label} value={value} onChange={onChange} />
		}
		default: {
			return null
		}
	}
}
