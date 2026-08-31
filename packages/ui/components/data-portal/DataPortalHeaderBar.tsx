import { Group, Text } from '@mantine/core'
import { type Route } from 'nextjs-routes'

import { Link } from '~ui/components/core/Link'

import classes from './DataPortalHeaderBar.module.css'

export type DataPortalSection = 'tasks' | 'organizations' | 'admin' | 'system'

interface SectionDef {
	id: DataPortalSection
	label: string
	href?: Route
	enabled: boolean
}

export interface DataPortalHeaderBarProps {
	/** Which section's link renders with the active-state underline. */
	activeSection: DataPortalSection
	/**
	 * System is root-only - every other section's enabled state is fixed for this phase (Tasks has no
	 * destination page yet; Organizations/Admin are real, reachable pages).
	 */
	systemEnabled?: boolean
}

/**
 * The Data Portal's own persistent section nav - distinct from the app-wide consumer `Navbar`, which it
 * stacks below rather than replaces (see docs/DataPortal/2026-Redesign/UI_elements.md, "Implementation
 * Constraints for This Pass"). Carries no user-identity display of its own; the consumer Navbar's avatar menu
 * already covers that.
 */
export const DataPortalHeaderBar = ({ activeSection, systemEnabled = false }: DataPortalHeaderBarProps) => {
	const sections: SectionDef[] = [
		{ id: 'tasks', label: 'Tasks', enabled: false },
		{
			id: 'organizations',
			label: 'Organizations',
			href: { pathname: '/data-portal/organizations' },
			enabled: true,
		},
		{ id: 'admin', label: 'Admin', href: { pathname: '/data-portal/manage-users' }, enabled: true },
		{
			id: 'system',
			label: 'System',
			href: { pathname: '/data-portal/quicklink' },
			enabled: systemEnabled,
		},
	]

	return (
		<Group component='nav' aria-label='Data Portal sections' className={classes.bar} gap={32} wrap='nowrap'>
			<Text fw={700} size='sm' c='dimmed'>
				InReach Data Portal
			</Text>
			<Group gap={24} wrap='nowrap'>
				{sections.map((section) => {
					const isActive = section.id === activeSection
					return section.enabled && section.href ? (
						<Link
							key={section.id}
							href={section.href}
							className={classes.link}
							data-active={isActive ? 'true' : undefined}
						>
							{section.label}
						</Link>
					) : (
						<Text
							key={section.id}
							component='span'
							className={classes.linkDisabled}
							aria-disabled='true'
							title='Not available yet'
						>
							{section.label}
						</Text>
					)
				})}
			</Group>
		</Group>
	)
}
