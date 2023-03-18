import {
	Checkbox,
	createStyles,
	Group,
	Text,
	Title,
	UnstyledButton,
	Modal,
	TitleProps,
	TextProps,
	ScrollArea,
	useMantineTheme,
	Skeleton,
	rem,
	em,
	Stack,
	Box,
	UnstyledButtonProps,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useMediaQuery, useViewportSize } from '@mantine/hooks'
import { createPolymorphicComponent } from '@mantine/utils'
import { useTranslation } from 'next-i18next'
import { useEffect, useState, forwardRef, MouseEventHandler } from 'react'

import { Button } from '~ui/components/core/Button'
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
		padding: `${rem(14)} ${rem(20)} ${rem(14)} ${rem(16)}`,
		backgroundColor: theme.other.colors.secondary.white,
		borderRadius: rem(8),
		border: `${theme.other.colors.tertiary.coolGray} ${rem(1)} solid`,
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

const MoreFilterBody = forwardRef<HTMLButtonElement, MoreFilterProps>((props, ref) => {
	const { data: moreFilterOptionData, status } = api.attribute.getFilterOptions.useQuery()
	const { classes } = useStyles()
	const { classes: accordionClasses } = useAccordionStyles()
	const { classes: modalClasses } = useModalStyles()
	const { t } = useTranslation(['common', 'attribute'])
	const [opened, setOpened] = useState(false)
	const theme = useMantineTheme()

	const isMobileQuery = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`)
	const isLandscape = useMediaQuery(`(orientation: landscape) and (max-height: ${em(430)})`)
	const isSmallLandscape = useMediaQuery(
		`(orientation: landscape) and (max-height: ${em(376)}) and (max-width: ${theme.breakpoints.xs})`
	)
	const isMobile = isMobileQuery || isLandscape
	const viewportHeight = useViewportSize().height + (isLandscape ? (isSmallLandscape ? 40 : 20) : 0)
	const scrollAreaMaxHeight = isMobile ? viewportHeight - 210 + 30 : viewportHeight * 0.6 - 88

	const { resultCount } = props

	type AttributeFilter = NonNullable<typeof moreFilterOptionData>[number]
	type FilterValue = AttributeFilter & { checked: boolean }

	const form = useForm<FilterValue[]>({ initialValues: [] })
	const generateInitialData = () => {
		if (!moreFilterOptionData) return []
		const initialValues = moreFilterOptionData.map((filter) => ({
			...filter,
			checked: false,
		}))
		return initialValues
	}

	useEffect(() => {
		if (moreFilterOptionData && status === 'success') {
			const initialValues = generateInitialData()
			form.setValues(initialValues)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [moreFilterOptionData, status])

	if (!moreFilterOptionData) return <Skeleton height={48} width='100%' radius='xs' />

	const deselectAll = () => form.setValues(generateInitialData())

	const filterListInclude: JSX.Element[] = []
	const filterListExclude: JSX.Element[] = []

	for (const [i, filter] of Object.entries(form.values)) {
		switch (filter.filterType) {
			case 'INCLUDE': {
				filterListInclude.push(
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
				filterListExclude.push(
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

	const selectedItems = (function () {
		const selected: string[] = []
		for (const [key, value] of Object.entries(form.values)) {
			if (value.checked) selected.push(value.id)
		}
		return selected
	})()

	const selectedCountIcon = <Text className={classes.count}>{selectedItems.length}</Text>

	const TitleBar = ({ modalTitle = false }: { modalTitle?: boolean }) => {
		const FilterDisplay = (props: typeof modalTitle extends true ? TitleProps : TextProps) =>
			modalTitle ? <Title order={2} mb={0} {...props} /> : <Text className={classes.label} {...props} />

		return (
			<Group className={modalTitle ? undefined : classes.button} position='apart' noWrap spacing={0}>
				<Group spacing={8} noWrap>
					<FilterDisplay>{t('more.filters')}</FilterDisplay>
					{selectedItems.length > 0 ? selectedCountIcon : null}
				</Group>

				{modalTitle ? (
					<Text
						fw={500}
						onClick={() => deselectAll()}
						className={selectedItems.length > 0 ? classes.uncheck : classes.uncheckDisabled}
					>
						{t('uncheck-all')}
					</Text>
				) : (
					<Icon icon='carbon:chevron-down' height={24} />
				)}
			</Group>
		)
	}

	const DefaultLauncher = (
		props: UnstyledButtonProps & { onClick: MouseEventHandler<HTMLButtonElement> }
	) => (
		<UnstyledButton w='100%' {...props}>
			<TitleBar />
		</UnstyledButton>
	)

	return (
		<>
			<Modal
				opened={opened}
				onClose={() => setOpened(false)}
				title={<TitleBar modalTitle />}
				fullScreen={isMobile}
				classNames={modalClasses}
				scrollAreaComponent={Modal.NativeScrollArea}
			>
				<Stack spacing={24} pb={12}>
					<ScrollArea.Autosize
						classNames={{ viewport: accordionClasses.scrollArea }}
						mah={scrollAreaMaxHeight}
					>
						<Stack className={classes.sectionLabel} spacing={4} mt={0}>
							<Title order={3}>{t('include')}</Title>
							{filterListInclude}
						</Stack>
						<Stack className={classes.sectionLabel} spacing={4}>
							<Title order={3}>{t('exclude')}</Title>
							{filterListExclude}
						</Stack>
					</ScrollArea.Autosize>
				</Stack>
				<Group className={modalClasses.footer} noWrap>
					<Button
						variant='secondary'
						onClick={() => deselectAll()}
						disabled={selectedItems.length < 1}
						className={classes.uncheckBtn}
					>
						{t('uncheck-all')}
					</Button>
					<Button variant='primary' className={classes.resultsBtn} onClick={() => setOpened(false)}>
						{t('view-x-result', { count: resultCount })}
					</Button>
				</Group>
			</Modal>

			<Box ref={ref} component={DefaultLauncher} onClick={() => setOpened(true)} {...props} />
		</>
	)
})
MoreFilterBody.displayName = 'MoreFilters'

export const MoreFilter = createPolymorphicComponent<'button', MoreFilterProps>(MoreFilterBody)

interface MoreFilterProps extends UnstyledButtonProps {
	resultCount?: number
}
