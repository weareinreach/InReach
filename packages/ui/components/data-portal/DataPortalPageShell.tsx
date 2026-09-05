import { Box, Group, Stack } from '@mantine/core'
import { useSession } from 'next-auth/react'
import { type ReactNode } from 'react'

import { DataPortalHeaderBar, type DataPortalSection } from './DataPortalHeaderBar'
import { SideNav, type SideNavItem } from './SideNav'

export interface DataPortalPageShellProps {
	activeSection: DataPortalSection
	sideNav: {
		heading: string
		items: SideNavItem[]
	}
	children: ReactNode
}

/**
 * The Data Portal's navigation skeleton: `DataPortalHeaderBar` on top, `SideNav` on the left, page content on
 * the right. See docs/DataPortal/2026-Redesign/UI_elements.md, "Suggested Build Order" step 3.
 *
 * `systemEnabled` is computed here (not accepted as a prop) so every page gets it for free instead of
 * re-deriving it - this mirrors the `isRoot` check in packages/api/lib/middleware/permissions.ts, but is
 * strictly a UI affordance (whether System renders clickable vs. grayed out). It grants no access on its own:
 * Quicklink's own `getServerSideProps` (root + @inreach.org, checked server-side) remains the real gate
 * regardless of what this shows.
 */
export const DataPortalPageShell = ({ activeSection, sideNav, children }: DataPortalPageShellProps) => {
	const { data: session } = useSession()
	const userPerms = session?.user?.permissions ?? []
	const systemEnabled = userPerms.some((p) => ['root', 'sysadmin', 'system'].includes(p))

	return (
		<Box>
			<DataPortalHeaderBar activeSection={activeSection} systemEnabled={systemEnabled} />
			<Group align='flex-start' wrap='nowrap' gap={0} p='xl'>
				<SideNav heading={sideNav.heading} items={sideNav.items} />
				<Box style={{ flex: 1, minWidth: 0 }} pl='xl'>
					<Stack gap='lg'>{children}</Stack>
				</Box>
			</Group>
		</Box>
	)
}
