import { ActionIcon, Menu, Tooltip } from '@mantine/core'
import { useCallback } from 'react'

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

interface AddFilterMenuItemProps<TFacetId extends string> {
	facet: AddFilterMenuFacet<TFacetId>
	onAdd: (id: TFacetId) => void
}

/**
 * One "+ Filter" menu row - its own component (rather than an inline arrow closing over `facet.id` in the
 * `.map()` below) purely so the click handler isn't an inline function literal in a JSX prop.
 */
const AddFilterMenuItem = <TFacetId extends string>({ facet, onAdd }: AddFilterMenuItemProps<TFacetId>) => {
	const handleClick = useCallback(() => onAdd(facet.id), [facet.id, onAdd])
	return <Menu.Item onClick={handleClick}>{facet.label}</Menu.Item>
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
					<AddFilterMenuItem key={facet.id} facet={facet} onAdd={onAdd} />
				))}
			{facets.every((facet) => activeFacets.includes(facet.id)) && (
				<Menu.Item disabled>All filters added</Menu.Item>
			)}
		</Menu.Dropdown>
	</Menu>
)
