import {
	BULK_SEARCH_REPLACE_NAV_HELP,
	DOWNLOADS_NAV_HELP,
	LOCATION_PHONE_CLEANUP_HELP,
	MANAGER_AND_ABOVE_PERMISSIONS,
	ORGANIZATIONS_NAV_HELP,
	REPORTS_NAV_HELP,
	REVIEWS_NAV_HELP,
	type SideNavItem,
} from './SideNav'

type OrganizationsSideNavLabel =
	'Organizations' | 'Reviews' | 'Reports' | 'Downloads' | 'Bulk Search & Replace' | 'Location Phone Cleanup'

// One definition instead of six pages (organizations.tsx, reviews.tsx, reports.tsx, downloads.tsx,
// bulk-search-replace.tsx, location-phone-cleanup.tsx) each hand-copying this same array, differing only in
// which item is `active` - that copy-paste was flagged as duplicated code (SonarCloud) once each item also
// grew a `help` tooltip and (for the manager-and-above three) a `permissions` field.
const ORGANIZATIONS_SIDE_NAV_ITEMS: SideNavItem[] = [
	{ label: 'Organizations', href: { pathname: '/data-portal/organizations' }, help: ORGANIZATIONS_NAV_HELP },
	{ label: 'Reviews', href: { pathname: '/data-portal/reviews' }, help: REVIEWS_NAV_HELP },
	{ label: 'Reports', href: { pathname: '/data-portal/reports' }, help: REPORTS_NAV_HELP },
	{
		label: 'Downloads',
		href: { pathname: '/data-portal/downloads' },
		help: DOWNLOADS_NAV_HELP,
		permissions: MANAGER_AND_ABOVE_PERMISSIONS,
	},
	{
		label: 'Bulk Search & Replace',
		href: { pathname: '/data-portal/bulk-search-replace' },
		help: BULK_SEARCH_REPLACE_NAV_HELP,
		permissions: MANAGER_AND_ABOVE_PERMISSIONS,
	},
	// TEMPORARY - see location-phone-cleanup.tsx; remove this entry once that review is done.
	{
		label: 'Location Phone Cleanup',
		href: { pathname: '/data-portal/location-phone-cleanup' },
		help: LOCATION_PHONE_CLEANUP_HELP,
		permissions: MANAGER_AND_ABOVE_PERMISSIONS,
	},
]

/**
 * Each page passes its own label so exactly one item renders `active` - everything else about the nav is
 * identical across all six pages that show it.
 */
export const organizationsSideNav = (activeLabel: OrganizationsSideNavLabel) => ({
	heading: 'Organizations',
	items: ORGANIZATIONS_SIDE_NAV_ITEMS.map((item) => ({ ...item, active: item.label === activeLabel })),
})
