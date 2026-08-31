import { Text } from '@mantine/core'

export interface ResultCountProps {
	count: number
	label?: string
}

/**
 * A "Total: N" line sitting above a table's toolbar - a template-level feature any table can opt into. See
 * docs/DataPortal/2026-Redesign/UI_elements.md, "Needed changes to the template" item 3.
 */
export const ResultCount = ({ count, label = 'Total' }: ResultCountProps) => (
	<Text size='sm' c='dimmed'>
		{label}: {count.toLocaleString()}
	</Text>
)
