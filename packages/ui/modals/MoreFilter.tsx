import {
	Box,
	Checkbox,
	createStyles,
	em,
	Group,
	Modal,
	rem,
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
import { createPolymorphicComponent } from '@mantine/utils'
import compact from 'just-compact'
import { useTranslation } from 'next-i18next'
import {
	forwardRef,
	memo,
	type MouseEventHandler,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
} from 'react'

import { Button } from '~ui/components/core/Button'
import { Link } from '~ui/components/core/Link'
import { useSearchState } from '~ui/hooks/useSearchState'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const useAccordionStyles = createStyles((theme) => ({
	label: {
		...theme.other.utilityFonts.utility1,
	},
	content: {
		padding: `${rem(0)} ${rem(0)} ${rem(12)} ${rem(0)}`,
	},
	item: {
		margin: 0,
		'&:last-of-type': {
			marginBottom: rem(40),
		},
	},
	chevron: { '&[data-rotate]': { transform: 'rotate(90deg)' } },
	scrollArea: {
		paddingRight: rem(12),
	},
	control: {
		padding: `${rem(12)} ${rem(0)}`,
	},
	panel: {
		padding: 0,
	},
}))

const useModalStyles = createStyles((theme) => ({
	body: {
		padding: `${rem(10)} ${rem(4)} ${rem(10)} ${rem(16)}`,
		[theme.fn.largerThan('xs')]: {
			padding: `${rem(40)} ${rem(8)} ${rem(20)} ${rem(20)}`,
		},
		[theme.fn.largerThan('sm')]: {
			padding: `${rem(40)} ${rem(20)} ${rem(20)} ${rem(32)}`,
		},
		[theme.fn.smallerThan('sm')]: {
			maxHeight: 'none',
			padding: `${rem(10)} ${rem(9)} ${rem(30)} ${rem(20)}`,
		},
		[`@media (orientation: landscape) and (max-height: ${em(376)})`]: {
			paddingBottom: rem(20),
		},
		[`@media (orientation: landscape) and (max-height: ${em(430)})`]: {
			maxHeight: 'none',
			paddingTop: rem(20),
		},
		'&:not(:only-child)': {
			paddingTop: rem(10),
			[theme.fn.largerThan('sm')]: {
				paddingTop: rem(40),
			},
		},
	},
	title: {
		padding: `${rem(8)} ${rem(0)} ${rem(8)} ${rem(8)}`,
		width: '100%',
	},
	header: {},
	modal: {},
	footer: {
		borderTop: `solid ${rem(1)} ${theme.other.colors.primary.lightGray}`,
		padding: `${rem(20)} ${rem(12)} ${rem(0)} ${rem(0)}`,
		[theme.fn.smallerThan('sm')]: {
			padding: `${rem(32)} ${rem(12)} ${rem(0)} ${rem(0)}`,
		},
		[`${theme.fn.smallerThan(em(375))}, (orientation: landscape) and (max-height: ${em(376)})`]: {
			paddingTop: rem(20),
		},
	},
}))

const useStyles = createStyles((theme) => ({
	label: {
		...theme.other.utilityFonts.utility1,
		[theme.fn.smallerThan('sm')]: {
			textAlign: 'center',
		},
		'&[data-disabled]': {
			color: theme.other.colors.secondary.darkGray,
		},
	},
	launchButton: {
		'&:disabled, &[data-disabled]': {
			color: theme.other.colors.secondary.darkGray,
			pointerEvents: 'none',
		},
	},

	count: {
		...theme.other.utilityFonts.utility1,
		background: theme.other.colors.secondary.black,
		borderRadius: '100%',
		color: theme.other.colors.secondary.white,
		width: rem(24),
		height: rem(24),
		textAlign: 'center',
		display: 'inline-block',
		verticalAlign: 'center',
		lineHeight: 1.5,
	},

	button: {
		padding: `${rem(14)} ${rem(16)}`,
		backgroundColor: theme.other.colors.secondary.white,
		borderRadius: rem(8),
		border: `${theme.other.colors.tertiary.coolGray} ${rem(1)} solid`,
		height: rem(48),
		'&:disabled, &[data-disabled]': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},

	itemParent: {},
	itemChild: {
		'&:last-of-type': {
			marginBottom: rem(40),
		},
	},
	uncheck: {
		color: theme.other.colors.secondary.black,
		textDecoration: 'underline',
		'&:hover': {
			textDecoration: 'underline',

			color: theme.other.colors.secondary.black,
			cursor: 'pointer',
		},
		[`${theme.fn.smallerThan('sm')}, not (orientation: landscape) and (max-height: ${theme.breakpoints.xs})`]:
			{
				display: 'none',
			},
	},
	uncheckDisabled: {
		textDecoration: 'underline',
		color: theme.other.colors.secondary.darkGray,
		'&:hover': {
			cursor: 'not-allowed',
		},
		[`${theme.fn.smallerThan('sm')}, not (orientation: landscape) and (max-height: ${theme.breakpoints.xs})`]:
			{
				display: 'none',
			},
	},
	uncheckBtn: {
		width: '50%',
		borderRadius: rem(8),
		padding: `${rem(6)} ${rem(8)}`,
		[theme.fn.largerThan('sm')]: {
			display: 'none',
		},
		[theme.fn.smallerThan(em(375))]: {
			marginRight: 'unset',
			'& *': {
				fontSize: `${rem(14)} !important`,
			},
		},
		height: rem(48),
	},
	resultsBtn: {
		borderRadius: rem(8),
		[theme.fn.smallerThan('sm')]: {
			width: '50%',
			padding: `${rem(6)} ${rem(8)}`,
		},
		[theme.fn.smallerThan(em(375))]: {
			marginLeft: 'unset',
			'& *': {
				fontSize: `${rem(14)} !important`,
			},
		},
		width: '100%',
		height: rem(48),
	},
	sectionLabel: {
		// ...theme.headings.sizes.h3,
		marginTop: rem(24),
	},
}))

type FilterDisplayProps<T extends boolean> = T extends true ? TitleProps : TextProps
const FilterDisplay = <T extends boolean>({
	modalTitle,
	disabled,
	...props
}: { modalTitle?: T; disabled?: boolean } & FilterDisplayProps<T>) => {
	const { classes } = useStyles()
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
	const { classes } = useStyles()
	const { t } = useTranslation('common')

	const titleBarContent = modalTitle ? (
		<>
			<Group spacing={8} noWrap>
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
			<Group spacing={8} noWrap position='center' w='100%'>
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
			position='apart'
			noWrap
			spacing={0}
			{...(disabled && { 'data-disabled': disabled })}
		>
			{titleBarContent}
		</Group>
	)
}

const SelectedItemCount = ({ selectedItemCount }: { selectedItemCount: number }) => {
	const { classes } = useStyles()
	return <Text className={classes.count}>{selectedItemCount}</Text>
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
		const { classes } = useStyles()
		const { classes: accordionClasses } = useAccordionStyles()
		const { classes: modalClasses } = useModalStyles()
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

		useEffect(() => {
			if (moreFilterOptionData && status === 'success') {
				const initialValues = generateInitialData()
				form.setValues(initialValues)
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [generateInitialData, moreFilterOptionData, status])

		useEffect(() => {
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
					classNames={modalClasses}
					scrollAreaComponent={Modal.NativeScrollArea}
				>
					<Stack spacing={24}>
						<ScrollArea.Autosize
							placeholder={null}
							classNames={{ viewport: accordionClasses.scrollArea }}
							mah={scrollAreaMaxHeight}
							// Typescript wants these two properties all of a sudden -- why?
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<Stack className={classes.sectionLabel} spacing={4} mt={0}>
								<Title order={3}>{t('modal-more-options.include')}</Title>
								{filterListInclude}
							</Stack>
							<Stack className={classes.sectionLabel} spacing={4}>
								<Title order={3}>{t('modal-more-options.exclude')}</Title>
								{filterListExclude}
							</Stack>
						</ScrollArea.Autosize>
					</Stack>
					<Group className={modalClasses.footer} noWrap>
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
