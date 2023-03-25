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
	rem,
	em,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useMediaQuery, useViewportSize } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'

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
		minHeight: rem(48),
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
		...theme.fn.hover({
			backgroundColor: theme.other.colors.primary.lightGray,
		}),
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
		padding: `${rem(14)} ${rem(16)}`,
		backgroundColor: theme.other.colors.secondary.white,
		borderRadius: rem(8),
		border: `${theme.other.colors.tertiary.coolGray} ${rem(1)} solid`,
		height: rem(48),
	},

	itemParent: {},
	itemChild: {
		marginLeft: rem(40),
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
}))

export const ServiceFilter = ({ resultCount }: ServiceFilterProps) => {
	const { data: serviceOptionData, status } = api.service.getFilterOptions.useQuery()
	const { classes, cx } = useStyles()
	const { classes: accordionClasses } = useAccordionStyles()
	const { classes: modalClasses } = useModalStyles()
	const { t } = useTranslation(['common', 'services'])
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

	type ServiceCategory = NonNullable<typeof serviceOptionData>[number]
	type FilterValue = ServiceCategory['services'][number] & { categoryId: string; checked: boolean }

	const form = useForm<{ [categoryId: string]: FilterValue[] }>()
	const valueMap = new Map<string, FilterValue[]>()

	const generateInitialData = () => {
		if (!serviceOptionData) return {}
		serviceOptionData.forEach((category) => {
			valueMap.set(
				category.id,
				category.services.map((item) => ({ ...item, categoryId: category.id, checked: false }))
			)
		})
		const initialValues = Object.fromEntries(valueMap.entries())
		return initialValues
	}
	useEffect(() => {
		if (serviceOptionData && status === 'success') {
			const initialValues = generateInitialData()
			form.setValues(initialValues)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [serviceOptionData, status])

	if (!serviceOptionData) return <Skeleton height={48} width='100%' radius='xs' />

	const hasAll = (categoryId: string) => {
		if (!form.values.hasOwnProperty(categoryId)) return false
		return form.values[categoryId]?.every((item) => item.categoryId === categoryId && item.checked)
	}
	const hasSome = (categoryId: string) => {
		if (!form.values.hasOwnProperty(categoryId)) return false
		return (
			!hasAll(categoryId) &&
			form.values[categoryId]?.some((item) => item.categoryId === categoryId && item.checked)
		)
	}

	const toggleCategory = (categoryId: string) => {
		if (!form.values.hasOwnProperty(categoryId)) return
		form.setValues({
			[categoryId]: form.values[categoryId]?.map((value) => ({ ...value, checked: !hasAll(categoryId) })),
		})
	}
	const deselectAll = () => form.setValues(generateInitialData())

	const formObjectEntryArray = Object.entries(form.values)
	const filterList = formObjectEntryArray.map(([categoryId, services]) => {
		const checked = hasAll(categoryId)
		const indeterminate = hasSome(categoryId)

		const tsKey = serviceOptionData.find((category) => category.id === categoryId)?.tsKey ?? 'error'
		return (
			<Accordion.Item value={categoryId} key={categoryId}>
				<Accordion.Control>{t(tsKey, { ns: 'services' })}</Accordion.Control>
				<Accordion.Panel>
					<Checkbox
						checked={checked}
						indeterminate={indeterminate}
						label={t('all-service-category', { serviceCategory: `$t(services:${tsKey})` })}
						transitionDuration={0}
						onChange={() => toggleCategory(categoryId)}
						className={classes.itemParent}
					/>

					{services.map((item, index) => {
						return (
							<Checkbox
								className={classes.itemChild}
								label={t(item.tsKey, { ns: 'services' })}
								key={item.id}
								{...form.getInputProps(`${categoryId}.${index}.checked`, { type: 'checkbox' })}
							/>
						)
					})}
				</Accordion.Panel>
			</Accordion.Item>
		)
	})

	const selectedItems = (function () {
		const selected: string[] = []
		for (const [_categoryId, services] of Object.entries(form.values)) {
			services.forEach((service) => {
				if (service.checked) selected.push(service.id)
			})
		}
		return selected
	})()

	const selectedCountIcon = <Text className={classes.count}>{selectedItems.length}</Text>

	const ServiceBar = ({ modalTitle = false }: { modalTitle?: boolean }) => {
		const ServicesDisplay = (props: typeof modalTitle extends true ? TitleProps : TextProps) =>
			modalTitle ? <Title order={2} mb={0} {...props} /> : <Text className={classes.label} {...props} />

		return (
			<Group className={modalTitle ? undefined : classes.button} position='apart' noWrap spacing={0}>
				<Group spacing={8} noWrap>
					<ServicesDisplay>{t('services')}</ServicesDisplay>
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
				opened={opened}
				onClose={() => setOpened(false)}
				title={<ServiceBar modalTitle />}
				fullScreen={isMobile}
				classNames={modalClasses}
				scrollAreaComponent={Modal.NativeScrollArea}
			>
				<Accordion
					chevron={<Icon icon='carbon:chevron-right' />}
					transitionDuration={0}
					classNames={accordionClasses}
				>
					<ScrollArea.Autosize
						classNames={{ viewport: accordionClasses.scrollArea }}
						mah={scrollAreaMaxHeight}
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
				<ServiceBar />
			</UnstyledButton>
		</>
	)
}
interface ServiceFilterProps {
	resultCount?: number
}
