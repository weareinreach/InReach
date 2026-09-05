import { NavLink, Stack, Text } from '@mantine/core'
import { type Route } from 'nextjs-routes'

import { Link } from '~ui/components/core/Link'

export interface SideNavItem {
	label: string
	/** Omit for a disabled item - there's nothing valid to link to yet. */
	href?: Route
	active?: boolean
	/** Visible but non-interactive - use for items with no backing page/data yet, never omit the item itself. */
	disabled?: boolean
}

export interface SideNavProps {
	/** The section this nav belongs to, e.g. "Organizations", "Admin", "Tasks", "System". */
	heading: string
	items: SideNavItem[]
}

/**
 * A shared, parameterized left-nav: a section heading plus a list of links. Used identically across
 * Organizations, Admin, Tasks, and System - see docs/DataPortal/2026-Redesign/UI_elements.md, "Needed changes
 * to the template" item 7. Renders heading + links only, with no trailing action button by design (the Figma
 * mock's "Add task" button at the bottom of Task views' Side Nav was relocated to the page-heading row
 * instead, so this component never needs one).
 */
export const SideNav = ({ heading, items }: SideNavProps) => (
	<Stack gap={4} w={200} component='nav' aria-label={`${heading} navigation`}>
		<Text fw={700} size='sm' mb={8}>
			{heading}
		</Text>
		{items.map((item) => (
			<NavLink
				key={item.label}
				label={item.label}
				active={item.active}
				disabled={item.disabled}
				component={item.disabled ? undefined : Link}
				href={item.disabled ? undefined : item.href}
			/>
		))}
	</Stack>
)
