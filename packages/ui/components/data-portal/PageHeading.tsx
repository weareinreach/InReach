import { Group, Title } from '@mantine/core'
import { type ReactNode } from 'react'

export interface PageHeadingProps {
	title: string
	/**
	 * The page's primary action, if it has one (e.g. "Add new organization", "Add new team", "Add task"). A
	 * plain `ReactNode` rather than a label/href pair so callers own their own button/mutation wiring - this
	 * component only owns layout.
	 */
	action?: ReactNode
}

/**
 * Title on the left, an optional primary action on the right, same row - shared shape across every Data
 * Portal page. See docs/DataPortal/2026-Redesign/UI_elements.md, "Needed changes to the template" item 2.
 */
export const PageHeading = ({ title, action }: PageHeadingProps) => (
	<Group justify='space-between' align='center' wrap='nowrap'>
		<Title order={2}>{title}</Title>
		{action}
	</Group>
)
