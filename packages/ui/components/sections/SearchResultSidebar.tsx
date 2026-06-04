import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Divider, Group, Overlay, Skeleton, Stack, Switch, Text, Title, useMantineTheme } from '@mantine/core'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'

import { AntiHateMessage } from '~ui/components/core/AntiHateMessage'
import { SearchBox } from '~ui/components/core/SearchBox'
// import { SearchDistance } from '~ui/components/core/SearchDistance'
import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'

import { Button } from '../core'

const DEFAULT_FOCUS_ORDER = ['bipoc', 'hiv', 'immigrants', 'spanish-speakers', 'transgender', 'youth']

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
	const [focusOrder, setFocusOrder] = useState(DEFAULT_FOCUS_ORDER)

	useEffect(() => {
		const savedActive = localStorage.getItem('ir_active_focuses')
		if (savedActive) {
			try {
				setActiveFocuses(JSON.parse(savedActive) as string[])
			} catch (e) {
				// Silent fail for malformed JSON
			}
		}

		const savedOrder = localStorage.getItem('ir_focus_order')
		if (savedOrder) {
			try {
				const parsed = JSON.parse(savedOrder) as string[]
				// Sync saved order with current DEFAULT_FOCUS_ORDER to handle code changes
				const validItems = parsed.filter((item) => DEFAULT_FOCUS_ORDER.includes(item))
				const newItems = DEFAULT_FOCUS_ORDER.filter((item) => !validItems.includes(item))
				setFocusOrder([...validItems, ...newItems])
			} catch (e) {
				// Silent fail
			}
		}
	}, [])

	const handleActiveFocusesChange = (val: string[]) => {
		setActiveFocuses(val)
		localStorage.setItem('ir_active_focuses', JSON.stringify(val))
		window.dispatchEvent(new Event('ir_focus_changed'))
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
				<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={focusOrder} strategy={verticalListSortingStrategy}>
						<Stack spacing={10} mt={10}>
							{focusOrder.map((key) => (
								<SortableFocusSwitch
									key={key}
									id={key}
									label={t(`sort.${key}`)}
									isSelected={activeFocuses.includes(key)}
									disabled={!isAdvanced}
								/>
							))}
						</Stack>
					</SortableContext>
				</DndContext>
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
			{/* @ts-expect-error - component arg should be valid... */}
			<Button variant={variants.Button.primaryLg} component={Link} href='/suggest'>
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
