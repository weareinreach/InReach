import { Checkbox, MultiSelect, Select, Stack, TextInput } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'

import { type DataTableFilter, type DataTableFilterValue } from './types'

export interface ColumnFilterControlProps {
	label: string
	filter: DataTableFilter
	value: DataTableFilterValue | undefined
	onChange: (value: DataTableFilterValue | undefined) => void
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
			const [from, to] = Array.isArray(value)
				? (value as [Date | undefined, Date | undefined])
				: [undefined, undefined]
			return (
				<DatePickerInput
					type='range'
					label={label}
					value={[from ?? null, to ?? null]}
					onChange={(next) => {
						// v9 `DatePickerInput` always reports the new value as a date string (`YYYY-MM-DD`),
						// even though `value` still accepts `Date` objects - convert back at this boundary
						// so the rest of the filter pipeline can keep working with `Date` throughout.
						const [nextFrom, nextTo] = next
						const fromDate = nextFrom ? new Date(nextFrom) : undefined
						const toDate = nextTo ? new Date(nextTo) : undefined
						onChange(fromDate || toDate ? [fromDate, toDate] : undefined)
					}}
					clearable
					size='xs'
				/>
			)
		}
		default: {
			return null
		}
	}
}
