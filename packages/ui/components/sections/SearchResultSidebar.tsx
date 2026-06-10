import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Divider, Group, Overlay, Skeleton, Stack, Switch, Text, Title, useMantineTheme } from '@mantine/core'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react'

// import { SearchDistance } from '~ui/components/core/SearchDistance'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { AntiHateMessage } from '../core/AntiHateMessage'
import { Button } from '../core/Button'
import { SearchBox } from '../core/SearchBox'

/**
 * Maps DB attribute tags to sidebar translation keys in common.json (under 'sort').
 */
const SIDEBAR_TAG_CONFIG: Record<string, string> = {
	'bipoc-comm': 'bipoc',
	'hiv-comm': 'hiv',
	'immigrant-comm': 'immigrants',
	'spanish-speakers': 'spanish-speakers',
	'trans-comm': 'transgender',
	'lgbtq-youth-focus': 'youth',
}

const TARGET_TAGS = Object.keys(SIDEBAR_TAG_CONFIG)

const SortableFocusSwitch = ({
	id,
	label,
	isSelected,
	disabled,
}: {
	id: string
	label: string
	isSelected: boolean
	disabled: boolean
}) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id,
		disabled: !isSelected || disabled,
	})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 1 : 0,
	}

	return (
		<Group ref={setNodeRef} style={style} noWrap spacing={8}>
			{isSelected && !disabled && (
				<Icon icon='carbon:draggable' {...attributes} {...listeners} style={{ cursor: 'grab' }} />
			)}
			<Switch value={id} label={label} style={{ flex: 1 }} />
		</Group>
	)
}

export const SearchResultSidebar = ({
	resultCount,
	loadingManager,
	isAdvanced,
}: SearchResultSidebarProps) => {
	const { t } = useTranslation('common')
	const variants = useCustomVariant()
	const theme = useMantineTheme()
	const [activeFocuses, setActiveFocuses] = useState<string[]>([])
	const [focusOrder, setFocusOrder] = useState<string[]>([])

	const { data: focusOptions, isLoading: isOptionsLoading } =
		api.organization.getCommunityFocusOptions.useQuery()

	const sidebarFocuses = useMemo(() => {
		const items = focusOptions || []
		return items.filter((item) => TARGET_TAGS.includes(item.tag))
	}, [focusOptions])

	const focusIds = useMemo(() => sidebarFocuses.map((f) => f.id), [sidebarFocuses])

	useEffect(() => {
		if (isOptionsLoading || !sidebarFocuses.length) return

		const savedActive = localStorage.getItem('ir_active_focuses')
		if (savedActive) {
			try {
				const parsed = JSON.parse(savedActive) as string[]
				/**
				 * Validation: Ensure we only load valid CUIDs from local storage. This prevents old string-based keys
				 * (like "youth") from being sent to the API, which would result in a 0 relevance boost.
				 */
				const validActive = parsed.filter((id) => focusIds.includes(id))
				setActiveFocuses(validActive)
			} catch (e) {
				// Silent fail for malformed JSON
			}
		}

		const savedOrder = localStorage.getItem('ir_focus_order')
		try {
			const parsed = savedOrder ? (JSON.parse(savedOrder) as string[]) : []
			const validItems = parsed.filter((id) => focusIds.includes(id))
			const newItems = focusIds.filter((id) => !validItems.includes(id))
			setFocusOrder([...validItems, ...newItems])
		} catch (e) {
			setFocusOrder(focusIds)
		}
	}, [sidebarFocuses, focusIds, isOptionsLoading])

	const handleActiveFocusesChange = (val: string[]) => {
		const newlyActivated = val.filter((id) => !activeFocuses.includes(id))

		setActiveFocuses(val)
		localStorage.setItem('ir_active_focuses', JSON.stringify(val))

		setFocusOrder((prev) => {
			const activeBlock = prev.filter((id) => val.includes(id))
			const inactiveBlock = prev.filter((id) => !val.includes(id))

			let nextOrder: string[]
			if (newlyActivated.length > 0) {
				// Move newly activated items to the absolute top
				const filteredActive = activeBlock.filter((id) => !newlyActivated.includes(id))
				nextOrder = [...newlyActivated, ...filteredActive, ...inactiveBlock]
			} else {
				// Keep active items at the top and push inactive ones below
				nextOrder = [...activeBlock, ...inactiveBlock]
			}

			localStorage.setItem('ir_focus_order', JSON.stringify(nextOrder))
			return nextOrder
		})

		window.dispatchEvent(new Event('ir_focus_changed')) // Triggers reactive search refetch
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		if (over && active.id !== over.id) {
			setFocusOrder((items) => {
				const oldIndex = items.indexOf(active.id as string)
				const newIndex = items.indexOf(over.id as string)
				const nextOrder = arrayMove(items, oldIndex, newIndex)
				localStorage.setItem('ir_focus_order', JSON.stringify(nextOrder))
				window.dispatchEvent(new Event('ir_focus_changed'))
				return nextOrder
			})
		}
	}

	return (
		<Stack spacing={32} maw={300}>
			<Skeleton visible={typeof resultCount !== 'number'}>
				<Text variant={variants.Text.utility1}>{t('count.result', { count: resultCount })}</Text>
			</Skeleton>

			<Switch.Group
				label={t('sort.by-lgbtq-focus')}
				pos='relative'
				value={activeFocuses}
				onChange={handleActiveFocusesChange}
			>
				{isOptionsLoading ? (
					<Stack spacing={10} mt={10}>
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} h={32} />
						))}
					</Stack>
				) : (
					<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
						<SortableContext items={focusOrder} strategy={verticalListSortingStrategy}>
							<Stack spacing={10} mt={10}>
								{focusOrder.map((id) => {
									const item = sidebarFocuses.find((f) => f.id === id)
									if (!item) return null
									return (
										<SortableFocusSwitch
											key={id}
											id={id}
											label={t(`sort.${SIDEBAR_TAG_CONFIG[item.tag] || item.tag}`)}
											isSelected={activeFocuses.includes(id)}
											disabled={!isAdvanced}
										/>
									)
								})}
							</Stack>
						</SortableContext>
					</DndContext>
				)}
				{!isAdvanced && (
					<Overlay blur={0} color={theme.other.colors.secondary.white}>
						<Stack spacing={0} align='center' justify='center' h='100%'>
							<Title order={2}>🚧</Title>
							<Title order={2}>{t('words.coming-soon')}</Title>
						</Stack>
					</Overlay>
				)}
			</Switch.Group>

			<Divider />

			{/* <SearchDistance />
			<Divider /> */}

			<SearchBox
				type='organization'
				label={<Title order={3}>{t('search.look-up-org')}</Title>}
				loadingManager={loadingManager}
				pinToLeft
			/>
			<Divider mt={-10} />
			{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
			<Button variant={variants.Button.primaryLg} component={Link as any} {...({ href: '/suggest' } as any)}>
				{' '}
				{t('suggest-a-resource')}
			</Button>
			<AntiHateMessage />
		</Stack>
	)
}

interface SearchResultSidebarProps {
	resultCount?: number
	loadingManager: {
		setLoading: Dispatch<SetStateAction<boolean>>
		isLoading: boolean
	}
	isAdvanced?: boolean
}
