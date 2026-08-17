import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Divider, Group, Overlay, Skeleton, Stack, Switch, Text, Title, useMantineTheme } from '@mantine/core'
import { getCookie, setCookie } from 'cookies-next'
import Link from 'next/link'
import { useTranslation } from 'next-i18next/pages'
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

// Cookies (not localStorage) so the search results page's SSR can read this same preference on
// the server and prefetch focus-aware results, instead of only finding out client-side after the
// page has already loaded. One year mirrors how long localStorage would have kept this around.
const FOCUS_COOKIE_MAX_AGE = 60 * 60 * 24 * 365
const ACTIVE_FOCUSES_COOKIE = 'ir_active_focuses'
const FOCUS_ORDER_COOKIE = 'ir_focus_order'

/**
 * One-time migration for anyone who already saved a focus preference under the old localStorage-only
 * mechanism this replaced: if the new cookie isn't set yet but the legacy localStorage value still is, carry
 * it over into the cookie (so future page loads, including server-side ones, see it) and clear the legacy key
 * so this only ever runs once per browser. Returns whether a migration actually happened, so the caller can
 * notify listeners (namely the search results page) that now have a value to pick up on this same visit.
 */
const migrateLegacyFocusStorage = (cookieKey: string): boolean => {
	if (getCookie(cookieKey) !== undefined) {
		return false
	}
	const legacyValue = localStorage.getItem(cookieKey)
	if (legacyValue === null) {
		return false
	}
	setCookie(cookieKey, legacyValue, { maxAge: FOCUS_COOKIE_MAX_AGE })
	localStorage.removeItem(cookieKey)
	return true
}

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
			<Switch value={id} label={label} style={{ flex: 1 }} disabled={disabled} />
		</Group>
	)
}

export const SearchResultSidebar = ({
	resultCount,
	loadingManager,
	isAdvanced = false,
	disabled = false,
	onlySort = false,
}: SearchResultSidebarProps) => {
	const { t } = useTranslation('common')
	const variants = useCustomVariant()
	const theme = useMantineTheme()
	const isInteractionDisabled = !isAdvanced || resultCount === 0 || disabled
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

		const migratedActive = migrateLegacyFocusStorage(ACTIVE_FOCUSES_COOKIE)
		const migratedOrder = migrateLegacyFocusStorage(FOCUS_ORDER_COOKIE)
		if (migratedActive || migratedOrder) {
			// The search results page reads these cookies once on its own first render and
			// otherwise only re-checks them on this event - without dispatching it here, a
			// migration that just happened wouldn't be picked up until the next page load.
			window.dispatchEvent(new Event('ir_focus_changed'))
		}

		const savedActive = getCookie(ACTIVE_FOCUSES_COOKIE)
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

		const savedOrder = getCookie(FOCUS_ORDER_COOKIE)
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
		setCookie(ACTIVE_FOCUSES_COOKIE, val, { maxAge: FOCUS_COOKIE_MAX_AGE })

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

			setCookie(FOCUS_ORDER_COOKIE, nextOrder, { maxAge: FOCUS_COOKIE_MAX_AGE })
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
				setCookie(FOCUS_ORDER_COOKIE, nextOrder, { maxAge: FOCUS_COOKIE_MAX_AGE })
				window.dispatchEvent(new Event('ir_focus_changed'))
				return nextOrder
			})
		}
	}

	return (
		<Stack spacing={32} maw={300} align={onlySort ? 'center' : 'flex-start'}>
			{!onlySort && (
				<Skeleton visible={typeof resultCount !== 'number'}>
					<Text variant={variants.Text.utility1}>{t('count.result', { count: resultCount })}</Text>
				</Skeleton>
			)}

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
											disabled={isInteractionDisabled}
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

			{!onlySort && (
				<>
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
					{/* eslint-disable @typescript-eslint/no-explicit-any -- Mantine's polymorphic `component`
					prop and next/link's `Link` don't type-check cleanly together */}
					<Button
						variant={variants.Button.primaryLg}
						component={Link as any}
						{...({ href: '/suggest' } as any)}
					>
						{' '}
						{t('suggest-a-resource')}
					</Button>
					{/* eslint-enable @typescript-eslint/no-explicit-any */}
					<AntiHateMessage />
				</>
			)}
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
	disabled?: boolean
	onlySort?: boolean
}
