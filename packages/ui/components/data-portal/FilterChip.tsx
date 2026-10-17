import { ActionIcon, Group, Popover, UnstyledButton } from '@mantine/core'
import { type ReactNode } from 'react'

import { Icon } from '~ui/icon'

import { FilterHelpIcon } from './FilterHelp'

export interface FilterChipProps {
	label: string
	/**
	 * Short current-value text shown after the label (e.g. "2 selected", "Hide deleted") - omit while nothing's
	 * been picked yet, so the chip just reads as the bare label.
	 */
	summary?: string
	onRemove: () => void
	/** The actual filter control - only rendered once the chip is clicked open. */
	children: ReactNode
	/**
	 * Info tooltip content shown next to the chip's label - same idea as the Create Method filter's own
	 * tooltip. Omit for a filter self-explanatory enough not to need one.
	 */
	help?: ReactNode
	/**
	 * Whether the chip's popover should already be open the moment it first mounts - true (the default) for a
	 * filter that was just added from a "+ Filter" menu, so picking a value doesn't need an extra click to open
	 * what was just added. Pass `false` for a filter that starts active on page load rather than via that kind
	 * of explicit action (e.g. Bulk Search & Replace's Service Tags/Attributes, visible by default) - nothing
	 * was "just added," so nothing should pop open unprompted.
	 */
	defaultOpened?: boolean
}

/**
 * Collapses an active toolbar filter down to a small pill showing its label (and current value, once set)
 * instead of permanently occupying the full width of its control - `children` only renders inside a popover
 * once the chip itself is clicked, and collapses back down on an outside click (Mantine's own uncontrolled
 * `Popover` behavior - no click handler needed here).
 */
export const FilterChip = ({
	label,
	summary,
	onRemove,
	children,
	defaultOpened = true,
	help,
}: FilterChipProps) => (
	<Popover position='bottom-start' shadow='md' withinPortal={false} defaultOpened={defaultOpened}>
		<Group
			gap={4}
			wrap='nowrap'
			style={{
				border: '1px solid var(--mantine-color-default-border)',
				borderRadius: 'var(--mantine-radius-sm)',
				height: 30,
				paddingLeft: 10,
				paddingRight: 4,
			}}
		>
			<Popover.Target>
				<UnstyledButton style={{ fontSize: 'var(--mantine-font-size-xs)', whiteSpace: 'nowrap' }}>
					{label}
					{summary ? `: ${summary}` : ''}
				</UnstyledButton>
			</Popover.Target>
			{help && <FilterHelpIcon help={help} />}
			<ActionIcon size='xs' variant='subtle' aria-label={`Remove ${label} filter`} onClick={onRemove}>
				<Icon icon='carbon:close' height={10} />
			</ActionIcon>
		</Group>
		<Popover.Dropdown>{children}</Popover.Dropdown>
	</Popover>
)
