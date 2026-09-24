import { z } from 'zod'

import { OrgUnpublishedReason } from '@weareinreach/db/enums'

const ZDateRange = z
	.object({
		from: z.date().optional(),
		to: z.date().optional(),
	})
	.partial()

export const ZSortableColumn = z.enum(['name', 'lastVerified', 'updatedAt', 'createdAt'])

const ZSortingState = z.array(
	z.object({
		id: ZSortableColumn,
		desc: z.boolean(),
	})
)

// Doesn't map to one literal DB column. 'public' = source.source === 'suggestion' AND
// creatorHadDpAccess === false. 'internal' is a union of the other two real origins: suggested by
// someone with Data Portal access, OR added directly via the Data Portal - both mean "not actually the
// public." Omitted entirely = no filter ("All").
export const ZCreateMethod = z.enum(['public', 'internal'])

// 'any' (default) = org/service needs at least one of the selected values - 'all' = needs every one of them
// simultaneously. Only meaningful for facets where an org/service can genuinely hold several values at
// once (Community, Leader Badge, Service Tags, Service Attributes) - unlike Status/Create Method, whose
// values are mutually exclusive, so "any" is the only sensible reading there.
export const ZMatchMode = z.enum(['any', 'all'])

// The three ways a service can relate to a location - see docs/DataPortal/Tasks/vetting.md: a service has
// no `locationId` field; its only link to a location is the `OrgLocationService` join table, which can
// have zero rows (e.g. 211 Alberta's remote-only services). 'remote-with-location' additionally requires
// the `offers-remote-services` Attribute, distinguishing a location-based service that also offers remote
// access from one that's in-person only.
export const ZRemoteOption = z.enum(['remote-no-location', 'remote-with-location', 'in-person-only'])
export type TRemoteOption = z.infer<typeof ZRemoteOption>

// Supersedes a plain `published` boolean filter - 'published' means `published: true`, every other
// value means `published: false` AND that specific `unpublishedReason`. One filter answers "what's this
// org's status," not two (see docs/DataPortal/Organizations/README.md). Omitted/empty = "All".
export const ZStatusFilter = z.enum([
	'published',
	'new',
	'in-progress',
	'waiting',
	'inactive',
	'unaffirming',
	'unresponsive',
])
export type TStatusFilter = z.infer<typeof ZStatusFilter>

// Maps the hyphenated filter/wire value to the actual Prisma enum member - single source of truth,
// imported by both the real handler's `statusWhere` and the ui package's mock data, instead of each
// keeping its own copy that has to be kept in sync by hand.
export const STATUS_FILTER_TO_REASON: Record<Exclude<TStatusFilter, 'published'>, OrgUnpublishedReason> = {
	new: OrgUnpublishedReason.NEW,
	'in-progress': OrgUnpublishedReason.IN_PROGRESS,
	waiting: OrgUnpublishedReason.WAITING,
	inactive: OrgUnpublishedReason.INACTIVE,
	unaffirming: OrgUnpublishedReason.UNAFFIRMING,
	unresponsive: OrgUnpublishedReason.UNRESPONSIVE,
}

export const ZForOrganizationTableSchema = z.object({
	// Multi-select - selecting several is a union (OR), same convention as `createMethod`/ReportTable's
	// `issueType`.
	status: z.array(ZStatusFilter).optional(),
	deleted: z.boolean().optional(),
	createMethod: ZCreateMethod.optional(),
	search: z.string().optional(),
	/**
	 * Filters to orgs whose creator (see `creatorOrgIds` in query.forOrganizationTable.handler.ts) is any of
	 * these users - the "Created By" type-ahead filter (multi-select). Orgs with no `Suggestion` record at all
	 * (legacy data predating that flow) won't match any user.
	 */
	createdByUserIds: z.array(z.string()).optional(),
	// Community Focus and Leader Badge are both org-level Attribute ids (see organization.badgeOptions),
	// under different AttributeCategory tags ('service-focus' vs 'organization-leadership') - each its own
	// filter against Organization.attributeIds rather than merged into one, so picking a value from each
	// narrows together instead of being treated as the same facet.
	communityAttributeIds: z.array(z.string()).optional(),
	communityMatchMode: ZMatchMode.optional(),
	leaderAttributeIds: z.array(z.string()).optional(),
	leaderMatchMode: ZMatchMode.optional(),
	// Service Tags, Service Attributes, and Remote Options all describe facets of a *service*, not the org
	// directly - all three are combined into one `services.some(...)` condition in the handler (rather than
	// three independent org-level checks) so e.g. "Remote Options: no location" + "Service Tags: Mental
	// Health" only matches when one specific service is both, not when the org merely has some remote
	// service and some unrelated Mental Health service.
	serviceTagIds: z.array(z.string()).optional(),
	serviceTagMatchMode: ZMatchMode.optional(),
	serviceAttributeIds: z.array(z.string()).optional(),
	serviceAttributeMatchMode: ZMatchMode.optional(),
	remoteOptions: z.array(ZRemoteOption).optional(),
	lastVerified: ZDateRange.optional(),
	updatedAt: ZDateRange.optional(),
	createdAt: ZDateRange.optional(),
	sorting: ZSortingState.optional(),
	take: z.number().int().min(1).max(200).default(50),
	skip: z.number().int().min(0).default(0),
	// Temporary cleanup-report filter: restricts to orgs with more than one published location where
	// at least one phone is also linked to a (published) location - see OrganizationTable's
	// `locationPhoneCleanupOnly` prop and query.forOrganizationTable.handler.ts's
	// `locationPhoneCleanupIds`. Safe to delete this field, along with those, once the review driven by
	// the /data-portal/location-phone-cleanup page is done.
	needsLocationPhoneCleanup: z.boolean().optional(),
})
export type TForOrganizationTableSchema = z.infer<typeof ZForOrganizationTableSchema>
