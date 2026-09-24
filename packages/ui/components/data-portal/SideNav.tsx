import { NavLink, Stack, Text } from '@mantine/core'
import { useSession } from 'next-auth/react'
import { type Route } from 'nextjs-routes'
import { type ReactNode } from 'react'

import { checkPermissions } from '@weareinreach/auth'
import { type Permission } from '@weareinreach/db/generated/permission'
import { Link } from '~ui/components/core/Link'

import { FilterLabel } from './FilterHelp'

export interface SideNavItem {
	label: string
	/** Omit for a disabled item - there's nothing valid to link to yet. */
	href?: Route
	active?: boolean
	/** Visible but non-interactive - use for items with no backing page/data yet, never omit the item itself. */
	disabled?: boolean
	/**
	 * Info tooltip next to the label, for an item whose purpose isn't obvious from its name alone (e.g. a
	 * temporary staff-only review tool) - same `FilterLabel` pattern the toolbar filters use.
	 */
	help?: ReactNode
	/**
	 * Restricts this item to sessions with at least one of these permissions (same `has: 'some'` semantics as
	 * every other permission check in the app) - omit for an item everyone who can see this nav at all should
	 * see. Without this, a lower-permission user sees a link to a page whose own `getServerSideProps` gate
	 * would immediately redirect them away from it (e.g. Downloads/Bulk Search & Replace/Location Phone
	 * Cleanup, all manager-and-above, sitting in the same nav as the basic-access Organizations/Reviews/
	 * Reports).
	 */
	permissions?: Permission | Permission[]
}

// The permission level shared by every manager-and-above data-portal page (Downloads, Bulk Search &
// Replace, Location Phone Cleanup) - one array instead of each page's nav entry hand-copying it. `root`
// isn't listed since `checkPermissions` already bypasses it unconditionally.
export const MANAGER_AND_ABOVE_PERMISSIONS: Permission[] = ['dataPortalManager', 'dataPortalAdmin']

// Tooltip content for the Organizations-section nav, shared across all six pages that list it
// (organizations.tsx, reviews.tsx, reports.tsx, downloads.tsx, bulk-search-replace.tsx,
// location-phone-cleanup.tsx) - one string per item instead of six independently hand-copied copies that
// could quietly drift apart.
export const ORGANIZATIONS_NAV_HELP =
	'Browse, search, and manage every organization in the directory - unpublish or re-publish with a ' +
	"reason, drill into an org's locations, and check its audit history or internal notes."
export const REVIEWS_NAV_HELP =
	'Moderate user-submitted reviews of organizations - see the reviewer, rating, and text, and hide, ' +
	'unhide, or (managers and above) delete a review that violates policy.'
export const REPORTS_NAV_HELP =
	'Triage user-flagged issues raised against organizations or services - track status and whether the ' +
	"org's been informed, and jump straight to its edit page to fix the underlying problem."
export const DOWNLOADS_NAV_HELP =
	'Export CSV snapshots of data-portal data (organization status lists, reviews, organization/service ' +
	'counts) for offline reporting or analysis.'
export const BULK_SEARCH_REPLACE_NAV_HELP =
	'Search across organization and service text/taxonomy fields for a term, and replace every eligible ' +
	'match at once instead of editing each record by hand.'
export const LOCATION_PHONE_CLEANUP_HELP =
	'Temporary review tool: lists organizations whose main-page phone number might also be individually ' +
	'linked to one of their own locations - a display duplicate left over from a past bug fix. Safe to ' +
	'remove once this review is done.'

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
export const SideNav = ({ heading, items }: SideNavProps) => {
	const { data: session } = useSession()
	const visibleItems = items.filter(
		(item) => !item.permissions || checkPermissions({ session, permissions: item.permissions, has: 'some' })
	)

	return (
		<Stack gap={4} w={200} component='nav' aria-label={`${heading} navigation`}>
			<Text fw={700} size='sm' mb={8}>
				{heading}
			</Text>
			{visibleItems.map((item) => (
				<NavLink
					key={item.label}
					label={item.help ? <FilterLabel label={item.label} help={item.help} /> : item.label}
					active={item.active}
					disabled={item.disabled}
					component={item.disabled ? undefined : Link}
					href={item.disabled ? undefined : item.href}
				/>
			))}
		</Stack>
	)
}
