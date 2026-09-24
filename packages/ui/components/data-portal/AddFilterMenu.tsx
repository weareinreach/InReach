import { ActionIcon, Menu, Tooltip } from '@mantine/core'

import { Icon } from '~ui/icon'

export interface AddFilterMenuFacet<TFacetId extends string> {
	id: TFacetId
	label: string
}

export interface AddFilterMenuProps<TFacetId extends string> {
	facets: AddFilterMenuFacet<TFacetId>[]
	activeFacets: TFacetId[]
	onAdd: (id: TFacetId) => void
}

/**
 * The toolbar's "+ Filter" button - lists every facet not currently active, and activates it on click. Shared
 * by the Organization table and Bulk Search & Replace, whose "+ Filter" menus were otherwise byte-for-byte
 * identical.
 */
export const AddFilterMenu = <TFacetId extends string>({
	facets,
	activeFacets,
	onAdd,
}: AddFilterMenuProps<TFacetId>) => (
	<Menu closeOnItemClick position='bottom-start'>
		<Menu.Target>
			<Tooltip label='Add filter'>
				<ActionIcon variant='subtle' aria-label='Add filter'>
					<Icon icon='carbon:add' />
				</ActionIcon>
			</Tooltip>
		</Menu.Target>
		<Menu.Dropdown>
			{facets
				.filter((facet) => !activeFacets.includes(facet.id))
				.map((facet) => (
					<Menu.Item key={facet.id} onClick={() => onAdd(facet.id)}>
						{facet.label}
					</Menu.Item>
				))}
			{facets.every((facet) => activeFacets.includes(facet.id)) && (
				<Menu.Item disabled>All filters added</Menu.Item>
			)}
		</Menu.Dropdown>
	</Menu>
)
