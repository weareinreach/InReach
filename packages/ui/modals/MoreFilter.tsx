import {
	Box,
	Checkbox,
	createPolymorphicComponent,
	em,
	Group,
	Modal,
	ScrollArea,
	Skeleton,
	Stack,
	Text,
	type TextProps,
	Title,
	type TitleProps,
	UnstyledButton,
	type UnstyledButtonProps,
	useMantineTheme,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure, useMediaQuery, useViewportSize } from '@mantine/hooks'
import compact from 'just-compact'
import { useTranslation } from 'next-i18next/pages'
import {
	forwardRef,
	memo,
	type MouseEventHandler,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from 'react'

import { Button } from '~ui/components/core/Button'
import { Link } from '~ui/components/core/Link'
import { useSearchState } from '~ui/hooks/useSearchState'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import classes from './MoreFilter.module.css'

type FilterDisplayProps<T extends boolean> = T extends true ? TitleProps : TextProps
const FilterDisplay = <T extends boolean>({
	modalTitle,
	disabled,
	...props
}: { modalTitle?: T; disabled?: boolean } & FilterDisplayProps<T>) => {
	return modalTitle ? (
		<Title order={2} mb={0} {...(props as TitleProps)} />
	) : (
		<Text
			className={classes.label}
			{...(disabled && { 'data-disabled': disabled })}
			{...(props as TextProps)}
		/>
	)
}

interface TitleBarProps {
	modalTitle?: boolean
	disabled?: boolean
	selectedItemCount: number
	deselectAll: () => void
}
const TitleBar = ({
	modalTitle = false,
	disabled = false,
	selectedItemCount,
	deselectAll,
}: TitleBarProps) => {
	const { t } = useTranslation('common')

	const titleBarContent = modalTitle ? (
		<>
			<Group gap={8} wrap='nowrap'>
				<FilterDisplay>{t('more.options')}</FilterDisplay>
				{selectedItemCount > 0 ? <SelectedItemCount selectedItemCount={selectedItemCount} /> : null}
			</Group>
			{selectedItemCount > 0 ? (
				<Link
					fw={500}
					onClick={deselectAll}
					// className={selectedItemCount > 0 ? classes.uncheck : classes.uncheckDisabled}
				>
					{t('uncheck-all')}
				</Link>
			) : null}
		</>
	) : (
		<>
			<Group gap={8} wrap='nowrap' justify='center' w='100%'>
				<Icon icon='carbon:settings-adjust' rotate={2} />
				<FilterDisplay>{t('more.options')}</FilterDisplay>
			</Group>
			{selectedItemCount > 0 ? (
				<SelectedItemCount selectedItemCount={selectedItemCount} />
			) : (
				<Icon icon='carbon:chevron-down' height={24} />
			)}
		</>
	)

	return (
		<Group
			className={modalTitle ? undefined : classes.button}
			justify='space-between'
			wrap='nowrap'
			gap={0}
			{...(disabled && { 'data-disabled': disabled })}
		>
			{titleBarContent}
		</Group>
	)
}

const SelectedItemCount = ({ selectedItemCount }: { selectedItemCount: number }) => {
	const theme = useMantineTheme()
	return (
		<Text className={classes.count} c={theme.other.colors.secondary.white}>
			{selectedItemCount}
		</Text>
	)
}

const DefaultLauncher = ({
	deselectAll,
	modalTitle,
	selectedItemCount,
	...props
}: UnstyledButtonProps & { onClick: MouseEventHandler<HTMLButtonElement> } & TitleBarProps) => {
	const titleBarProps = useMemo(
		() => ({ modalTitle, deselectAll, selectedItemCount }),
		[modalTitle, deselectAll, selectedItemCount]
	)
	return (
		<UnstyledButton w='100%' {...props}>
			<TitleBar {...titleBarProps} />
		</UnstyledButton>
	)
}

const MoreFilterBody = forwardRef<HTMLButtonElement, MoreFilterProps>(
	({ resultCount, isFetching, disabled, ...props }, ref) => {
		const { data: moreFilterOptionData, status } = api.attribute.getFilterOptions.useQuery()
		const { t } = useTranslation(['common', 'attribute'])
		const [modalOpen, modalHandler] = useDisclosure(false)
		const theme = useMantineTheme()
		const { searchStateActions, searchState } = useSearchState()

		const isMobileQuery = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`)
		const isLandscape = useMediaQuery(`(orientation: landscape) and (max-height: ${em(430)})`)
		const isSmallLandscape = useMediaQuery(
			`(orientation: landscape) and (max-height: ${em(376)}) and (max-width: ${theme.breakpoints.xs})`
		)
		const isMobile = isMobileQuery || isLandscape
		const viewportSize = useViewportSize()
		const viewportOffset = useMemo(() => {
			if (isLandscape) {
				return isSmallLandscape ? 40 : 20
			}
			return 0
		}, [isLandscape, isSmallLandscape])

		const viewportHeight = useMemo(
			() => viewportSize.height + viewportOffset,
			[viewportOffset, viewportSize.height]
		)
		const scrollAreaMaxHeight = isMobile ? viewportHeight - 210 + 30 : viewportHeight * 0.6 - 88

		type AttributeFilter = NonNullable<typeof moreFilterOptionData>[number]
		type FilterValue = AttributeFilter & { checked: boolean }

		const form = useForm<FilterValue[]>({ initialValues: [] })
		const preSelected = useMemo(() => searchState.attributes, [searchState.attributes])

		const generateInitialData = useCallback(
			(opts?: { clear?: boolean }) => {
				if (!moreFilterOptionData) {
					return []
				}
				const initialValues = moreFilterOptionData.map((filter) => ({
					...filter,
					checked: !opts?.clear && preSelected.includes(filter.id),
				}))
				return initialValues
			},
			[moreFilterOptionData, preSelected]
		)

		// Tracks whether `form.values` has been populated from `preSelected` at least once. Until
		// then `form.values` is just its empty `initialValues`, and writing that back to search
		// state would clobber filters that were already applied before this component (re)mounted.
		const hasHydrated = useRef(false)
		// `form.setValues` below doesn't take effect on `form.values` synchronously - the write-back
		// effect can fire in the same cycle and still observe the *previous* form.values snapshot.
		// Left unguarded, that stale read writes the opposite of what hydration just set, which
		// flips `preSelected` on the next render and re-triggers hydration - a self-sustaining
		// two-step oscillation between the full and empty selection. This flag marks the write-back
		// firing that immediately follows our own setValues call so it can be skipped as an echo
		// rather than treated as a real user-driven change.
		const suppressNextWriteback = useRef(false)

		useEffect(() => {
			if (moreFilterOptionData && status === 'success') {
				const initialValues = generateInitialData()
				suppressNextWriteback.current = true
				form.setValues(initialValues)
				hasHydrated.current = true
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [generateInitialData, moreFilterOptionData, status])

		useEffect(() => {
			if (!hasHydrated.current) {
				return
			}
			if (suppressNextWriteback.current) {
				suppressNextWriteback.current = false
				return
			}
			const itemsSelected: string[] = []
			Object.values(form.values).forEach(({ checked, id }) => {
				if (checked) {
					itemsSelected.push(id)
				}
			})
			searchStateActions.setAttributes(itemsSelected)
		}, [form.values, searchStateActions])

		const deselectAll = useCallback(
			() => form.setValues(generateInitialData({ clear: true })),
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[generateInitialData]
		)
		const generateFilterIncludeExcludeList = useCallback(
			(formValues: FilterValue[]) => {
				const filterInclude: ReactNode[] = []
				const filterExclude: ReactNode[] = []

				for (const [i, filter] of Object.entries(formValues)) {
					switch (filter.filterType) {
						case 'INCLUDE': {
							filterInclude.push(
								<Checkbox
									// className={classes.itemChild}
									label={t(filter.tsKey, { ns: 'attribute' })}
									key={filter.id}
									{...form.getInputProps(`${i}.checked`, { type: 'checkbox' })}
								/>
							)
							break
						}
						case 'EXCLUDE': {
							filterExclude.push(
								<Checkbox
									className={classes.itemChild}
									label={t(filter.tsKey, { ns: 'attribute' })}
									key={filter.id}
									{...form.getInputProps(`${i}.checked`, { type: 'checkbox' })}
								/>
							)
							break
						}
					}
				}
				return {
					filterListInclude: filterInclude,
					filterListExclude: filterExclude,
				}
			},
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[classes, t]
		)

		const { filterListInclude, filterListExclude } = generateFilterIncludeExcludeList(form.values)

		const getSelectedItems = useCallback((formValues: FilterValue[]) => {
			return compact(Object.values(formValues).map(({ checked, id }) => (checked ? id : null)))
		}, [])

		const selectedItems = getSelectedItems(form.values)

		const selectedItemCount = useMemo(() => selectedItems.length, [selectedItems.length])

		const titleBarProps = useMemo(() => {
			return { deselectAll, selectedItemCount }
		}, [deselectAll, selectedItemCount])

		const modalTitleBar = useMemo(() => {
			return <TitleBar modalTitle deselectAll={deselectAll} selectedItemCount={selectedItemCount} />
		}, [deselectAll, selectedItemCount])

		if (!moreFilterOptionData) {
			return <Skeleton height={48} width='100%' radius='xs' />
		}

		return (
			<>
				<Modal
					opened={modalOpen}
					onClose={modalHandler.close}
					title={modalTitleBar}
					fullScreen={isMobile}
					classNames={{ body: classes.modalBody, title: classes.modalTitle }}
				>
					<Stack gap={24}>
						<ScrollArea.Autosize
							classNames={{ viewport: classes.accordionScrollArea }}
							mah={scrollAreaMaxHeight}
						>
							<Stack className={classes.sectionLabel} gap={4} mt={0}>
								<Title order={3}>{t('modal-more-options.include')}</Title>
								{filterListInclude}
							</Stack>
							<Stack className={classes.sectionLabel} gap={4}>
								<Title order={3}>{t('modal-more-options.exclude')}</Title>
								{filterListExclude}
							</Stack>
						</ScrollArea.Autosize>
					</Stack>
					<Group className={classes.modalFooter} wrap='nowrap'>
						<Button
							variant='secondary'
							onClick={deselectAll}
							disabled={selectedItems.length < 1}
							className={classes.uncheckBtn}
						>
							{t('uncheck-all')}
						</Button>
						<Button
							variant='primary'
							className={classes.resultsBtn}
							onClick={modalHandler.close}
							loading={isFetching}
						>
							{t('view-x-result', { count: resultCount })}
						</Button>
					</Group>
				</Modal>
				<Box
					ref={ref}
					component={DefaultLauncher}
					onClick={modalHandler.open}
					className={classes.launchButton}
					{...(disabled ? { disabled, 'data-disabled': disabled } : {})}
					{...titleBarProps}
					{...props}
				/>
			</>
		)
	}
)
MoreFilterBody.displayName = 'MoreFilters'

export const MoreFilter = memo(createPolymorphicComponent<'button', MoreFilterProps>(MoreFilterBody))

export interface MoreFilterProps extends UnstyledButtonProps {
	resultCount?: number
	isFetching?: boolean
	disabled?: boolean
}
