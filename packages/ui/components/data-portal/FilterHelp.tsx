import { Group, Stack, Text, Tooltip } from '@mantine/core'
import { type ReactNode } from 'react'

import { Icon } from '~ui/icon'

/**
 * Renders a tooltip's content as one line per item instead of one run-on paragraph - Mantine's `multiline`
 * Tooltip only wraps text at its own `w`, it doesn't insert a break between logically separate items on its
 * own (see the Create Method tooltip this was split out of fixing).
 */
export const helpLines = (lines: ReactNode[]): ReactNode => (
	<Stack gap={2}>
		{lines.map((line, index) => (
			// `Text` defaults to the theme's own body text color regardless of context - without
			// overriding it back to `inherit`, it renders as dark text on the Tooltip's own dark
			// background instead of the light color Tooltip normally gives its (plain-string) content.
			<Text key={index} size='xs' c='inherit'>
				{line}
			</Text>
		))}
	</Stack>
)

export interface FilterHelpIconProps {
	help: ReactNode
}

/**
 * The small (i) icon + tooltip alone, with no label text of its own - for a context that already renders its
 * own label right next to it (e.g. `FilterChip`, whose collapsed chip already shows the label as its own
 * clickable text). Use `FilterLabel` instead for a plain `Select`/`MultiSelect`'s own `label` prop.
 */
export const FilterHelpIcon = ({ help }: FilterHelpIconProps) => (
	<Tooltip label={help} multiline w={260}>
		<Icon icon='carbon:information' width={12} height={12} style={{ cursor: 'help' }} />
	</Tooltip>
)

export interface FilterLabelProps {
	label: string
	help: ReactNode
}

/**
 * Label text + info tooltip, for a plain `Select`/`MultiSelect`'s own `label` prop (e.g. Status, Create
 * Method) - see `FilterHelpIcon` for a `FilterChip`, which already renders the label text itself.
 */
export const FilterLabel = ({ label, help }: FilterLabelProps) => (
	<Group gap={4} wrap='nowrap'>
		<span>{label}</span>
		<FilterHelpIcon help={help} />
	</Group>
)
