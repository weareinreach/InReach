import { Checkbox, MultiSelect, Select, Stack, TextInput } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useState } from 'react'

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
			onChange={(next) => {
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
					onChange(fromDate || toDate ? [fromDate ?? undefined, toDate ?? undefined] : undefined)
				}
			}}
			clearable
			size='xs'
		/>
	)
}

/** Renders the appropriate filter input for a column's declared `filter.type`, inside a `Popover.Dropdown`. */
export const ColumnFilterControl = ({ label, filter, value, onChange }: ColumnFilterControlProps) => {
	switch (filter.type) {
		case 'text': {
			return (
				<TextInput
					label={label}
					placeholder={`Filter by ${label.toLowerCase()}`}
					value={typeof value === 'string' ? value : ''}
					onChange={(event) => onChange(event.currentTarget.value || undefined)}
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
						onChange={(event) => onChange(event.currentTarget.checked ? true : undefined)}
						size='xs'
					/>
					<Checkbox
						label={falseLabel}
						checked={value === false}
						onChange={(event) => onChange(event.currentTarget.checked ? false : undefined)}
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
					onChange={(next) => onChange(next ?? undefined)}
					clearable
					size='xs'
				/>
			)
		}
		case 'multi-select': {
			return (
				<MultiSelect
					label={label}
					data={filter.options}
					value={Array.isArray(value) ? (value as string[]) : []}
					onChange={(next) => onChange(next.length ? next : undefined)}
					clearable
					size='xs'
				/>
			)
		}
		case 'date-range': {
			return <DateRangeFilter label={label} value={value} onChange={onChange} />
		}
		default: {
			return null
		}
	}
}
