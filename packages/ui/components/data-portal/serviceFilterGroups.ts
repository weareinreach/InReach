import { type ApiOutput } from '@weareinreach/api'

import {
	type GroupedMultiSelectGroup,
	MULTISELECT_CASCADE_HELP,
	MULTISELECT_MATCH_HELP,
} from './GroupedMultiSelect'

// Leads with what the filter actually represents, not just the shared OR/cascade mechanics (which say
// nothing about what a "tag" or "attribute" even is here) - shared by the Organization table and Bulk
// Search & Replace, so both tables' tooltips read identically.
export const SERVICE_TAG_FILTER_HELP = [
	'Tags describing the type of service offered (e.g. "Legal Aid," "Housing," "Mental Health").',
	MULTISELECT_MATCH_HELP,
	MULTISELECT_CASCADE_HELP,
]
export const SERVICE_ATTRIBUTE_FILTER_HELP = [
	'Attributes describing specific qualities of a service (e.g. sliding-scale fees, wheelchair accessible, LGBTQ+ affirming).',
	MULTISELECT_MATCH_HELP,
]

/**
 * `ServiceCategory` has no plain display-name field, only a raw slug (e.g. "legal-aid") or a translated tsKey
 *
 * - Since translation isn't used in the data portal, this just turns the slug into something readable ("Legal
 *   Aid") rather than showing it verbatim.
 */
export const formatSlugLabel = (slug: string): string =>
	slug
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')

type ServiceTagCategories = ApiOutput['component']['ServiceSelect']

/**
 * Category-grouped, cascadable Service Tags options (a category's own "All X" row bulk-selects every tag in
 * it - matches the public search's "Filter by Service" behavior). Shared by the Organization table and Bulk
 * Search & Replace's toolbar quick filters, so both look and behave identically.
 */
export const toServiceTagGroups = (categories: ServiceTagCategories | undefined): GroupedMultiSelectGroup[] =>
	(categories ?? [])
		.filter((category) => category.services.length > 0)
		.map((category) => ({
			id: category.tsKey,
			label: formatSlugLabel(category.category),
			items: category.services.map((tag) => ({ id: tag.id, label: tag.name })),
			cascadable: true,
		}))

type ServiceAttributeRows = ApiOutput['fieldOpt']['attributesForFilter']

/**
 * Category-grouped Service Attributes options - no `cascadable` here, since neither service-attribute editing
 * nor any public-facing filter has a "select all in this category" precedent for plain attributes. Shared by
 * the Organization table and Bulk Search & Replace's toolbar quick filters.
 */
export const toServiceAttributeGroups = (
	rows: ServiceAttributeRows | undefined
): GroupedMultiSelectGroup[] => {
	const byCategory = new Map<string, GroupedMultiSelectGroup>()
	for (const row of rows ?? []) {
		const group = byCategory.get(row.categoryId) ?? { id: row.categoryId, label: row.categoryName, items: [] }
		group.items.push({ id: row.attributeId, label: row.attributeName })
		byCategory.set(row.categoryId, group)
	}
	return [...byCategory.values()]
}
