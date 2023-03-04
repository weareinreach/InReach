import {
	Accordion,
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
	filterProps,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useMediaQuery, useViewportSize } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
import { boolean } from 'zod'

import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { useModalProps } from '~ui/modals'

import { Button } from './Button'

const RESULT_PLACEHOLDER = 999

const useAccordionStyles = createStyles((theme) => ({
	label: {
		...theme.other.utilityFonts.utility1,
	},
	content: {
		padding: '0px 0px 12px 0px',
	},
	item: {
		margin: 0,
		'&:last-of-type': {
			marginBottom: '40px',
		},
	},
	chevron: { '&[data-rotate]': { transform: 'rotate(90deg)' } },
	scrollArea: {
		paddingRight: '12px',
	},
	control: {
		padding: '12px 0px',
	},
	panel: {
		padding: 0,
	},
}))

const useModalStyles = createStyles((theme) => ({
	body: {
		padding: '10px 4px 10px 16px',
		[theme.fn.largerThan('xs')]: {
			padding: '40px 8px 20px 20px',
		},
		[theme.fn.largerThan('sm')]: {
			padding: '40px 20px 20px 32px',
		},
		[theme.fn.smallerThan('sm')]: {
			maxHeight: 'none',
			padding: '10px 8px 40px 20px',
		},
		[`@media (orientation: landscape) and (max-height: 376px)`]: {
			paddingBottom: '20px',
		},
		[`@media (orientation: landscape) and (max-height: 430px)`]: {
			maxHeight: 'none',
			paddingTop: '20px',
		},
	},
	title: {
		padding: '8px 0px 8px 8px',
		width: '100%',
	},
	header: {},
	modal: {},
	footer: {
		borderTop: 'solid 1px' + theme.other.colors.primary.lightGray,
		padding: '20px 12px 0px 0px',
		[theme.fn.smallerThan('sm')]: {
			padding: '32px 12px 0px 0px',
		},
		[`${theme.fn.smallerThan(375)}, (orientation: landscape) and (max-height: 376px)`]: {
			paddingTop: '20px',
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
		width: 24,
		height: 24,
		textAlign: 'center',
		display: 'inline-block',
		verticalAlign: 'center',
		lineHeight: 1.5,
	},

	button: {
		padding: '14px 20px 14px 16px',
		backgroundColor: theme.other.colors.secondary.white,
		borderRadius: '8px',
		border: `${theme.other.colors.tertiary.coolGray} 1px solid`,
	},

	itemParent: {},
	itemChild: {
		marginLeft: '40px',
	},
	uncheck: {
		color: theme.other.colors.secondary.black,
		textDecoration: 'underline',
		'&:hover': {
			textDecoration: 'underline',

			color: theme.other.colors.secondary.black,
			cursor: 'pointer',
		},
		[`${theme.fn.smallerThan('sm')}, not (orientation: landscape) and (max-height: ${
			theme.breakpoints.xs
		}px)`]: {
			display: 'none',
		},
	},
	uncheckDisabled: {
		textDecoration: 'underline',
		color: theme.other.colors.secondary.darkGray,
		[`${theme.fn.smallerThan('sm')}, not (orientation: landscape) and (max-height: ${
			theme.breakpoints.xs
		}px)`]: {
			display: 'none',
		},
	},
	uncheckBtn: {
		width: '50%',
		borderRadius: '8px',
		padding: '6px 8px',
		[theme.fn.largerThan('sm')]: {
			display: 'none',
		},
		[theme.fn.smallerThan(375)]: {
			marginRight: 'unset',
			'& *': {
				fontSize: '14px !important',
			},
		},
	},
	resultsBtn: {
		borderRadius: '8px',
		[theme.fn.smallerThan('sm')]: {
			width: '50%',
			padding: '6px 8px',
		},
		[theme.fn.smallerThan(375)]: {
			marginLeft: 'unset',
			'& *': {
				fontSize: '14px !important',
			},
		},
		width: '100%',
	},
}))

export const MoreFilter = ({}) => {
	const { data: moreFilterOptionData, status } = api.attribute.getFilterOptions.useQuery()
	const { classes, cx } = useStyles()
	const { classes: accordionClasses } = useAccordionStyles()
	const { classes: modalClasses } = useModalStyles()
	const { t } = useTranslation(['common', 'attribute'])
	const [opened, setOpened] = useState(false)
	const modalSettings = useModalProps()
	const theme = useMantineTheme()

	const isMobileQuery = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`)
	const isLandscape = useMediaQuery(`(orientation: landscape) and (max-height: 430px)`)
	const isSmallLandscape = useMediaQuery(
		`(orientation: landscape) and (max-height: 376px) and (max-width: ${theme.breakpoints.xs}px)`
	)
	const isMobile = isMobileQuery || isLandscape
	const viewportHeight = useViewportSize().height + (isLandscape ? (isSmallLandscape ? 40 : 20) : 0)
	const scrollAreaMaxHeight = isMobile ? viewportHeight - 210 : viewportHeight * 0.6 - 88

	/** TODO: Results will be filtered live as items are selected - need to update the count of results left */
	const resultCount = RESULT_PLACEHOLDER

	type Filter = NonNullable<typeof moreFilterOptionData>[number]
	type FilterValue = Filter & { checked: boolean }

	const form = useForm()

	const generateInitialData = () => {
		if (!moreFilterOptionData) return {}
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
	}, [moreFilterOptionData, status])

	if (!moreFilterOptionData) return <Skeleton height={48} width='100%' radius='xs' />

	const deselectAll = () => form.setValues(generateInitialData())

	const formObjectEntryArray = Object.entries(form.values)
	const filterList = formObjectEntryArray.map((filter, index) => {
		return (
			<>
				<Checkbox
					className={classes.itemChild}
					label={filter[1].tsKey}
					key={filter[1].id}
					{...form.getInputProps(`${index}.checked`, { type: 'checkbox' })}
				/>
			</>
		)
	})

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
					<FilterDisplay>{t('more-filters')}</FilterDisplay>
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

	return (
		<>
			<Modal
				{...modalSettings}
				opened={opened}
				onClose={() => setOpened(false)}
				title={<TitleBar modalTitle />}
				fullScreen={isMobile}
				classNames={modalClasses}
			>
				<Accordion
					chevron={<Icon icon='carbon:chevron-right' />}
					transitionDuration={0}
					classNames={accordionClasses}
				>
					<ScrollArea.Autosize
						classNames={{ viewport: accordionClasses.scrollArea }}
						maxHeight={`${scrollAreaMaxHeight}px`}
					>
						{filterList}
					</ScrollArea.Autosize>
				</Accordion>
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

			<UnstyledButton onClick={() => setOpened(true)} w='100%'>
				<TitleBar />
			</UnstyledButton>
		</>
	)
}
