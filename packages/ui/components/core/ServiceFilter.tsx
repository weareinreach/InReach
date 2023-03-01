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
	Box,
	Skeleton,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'

import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { useModalProps } from '~ui/modals'

import { Button } from './Button'

const RESULT_PLACEHOLDER = 999

const useStyles = createStyles((theme) => ({
	label: {
		...theme.other.utilityFonts.utility1,
	},
	modalBody: {
		padding: '40px 32px',
		[theme.fn.smallerThan('md')]: {
			padding: '40px 20px',
		},
		[theme.fn.smallerThan('sm')]: {
			padding: '10px 16px',
		},
	},
	modalHeader: {
		padding: '0px 20px 0px 24px !important',
	},
	modalModal: {
		maxHeight: 'fit-content !important',
	},
	root: {
		overflow: 'scroll',
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
	modalTitle: {
		padding: '24px 24px 24px 32px',
		width: '100%',
	},
	button: {
		padding: '14px 20px 14px 16px',
		backgroundColor: theme.other.colors.secondary.white,
		borderRadius: '8px',
		border: `${theme.other.colors.tertiary.coolGray} 1px solid`,
	},
	item: {
		marginLeft: theme.spacing.md,
		marginRight: theme.spacing.md,
	},
	uncheck: {
		color: theme.other.colors.secondary.black,
		textDecoration: 'underline',
		'&:hover': {
			textDecoration: 'underline',

			color: theme.other.colors.secondary.black,
			cursor: 'pointer',
		},
		[theme.fn.smallerThan('md')]: {
			display: 'none',
		},
	},
	uncheckDisabled: {
		textDecoration: 'underline',
		color: theme.other.colors.secondary.darkGray,
		[theme.fn.smallerThan('md')]: {
			display: 'none',
		},
	},
	uncheckBtn: {
		width: '48%',
		borderRadius: '8px',
		marginRight: '4px',
		padding: '6px 8px',
		[theme.fn.largerThan('sm')]: {
			display: 'none',
		},
		[theme.fn.smallerThan(375)]: {
			width: '100%',
			marginRight: 'unset',
		},
	},
	resultsBtn: {
		borderRadius: '8px',
		[theme.fn.smallerThan('sm')]: {
			width: '48%',
			marginLeft: '4px',
			padding: '6px 8px',
		},
		[theme.fn.smallerThan(375)]: {
			width: '100%',
			marginTop: '12px',
			marginLeft: 'unset',
		},
		[theme.fn.largerThan('sm')]: {
			width: '100%',
		},
	},
	footer: {
		borderTop: 'solid 1px' + theme.other.colors.primary.lightGray,
		padding: '32px 16px 0px 16px',
		[theme.fn.smallerThan('md')]: {
			padding: '32px 0px 0px 0px',
		},
		[theme.fn.smallerThan(375)]: {
			paddingTop: '12px',
		},
	},
}))

export const ServiceFilter = ({}) => {
	const { data: serviceOptionData, status } = api.service.getFilterOptions.useQuery()
	const { classes, cx } = useStyles()
	const { t } = useTranslation(['common', 'services'])
	const [opened, setOpened] = useState(false)
	const modalSettings = useModalProps()
	const theme = useMantineTheme()

	/** TODO: Results will be filtered live as items are selected - need to update the count of results left */
	const resultCount = RESULT_PLACEHOLDER

	type ServiceCategory = NonNullable<typeof serviceOptionData>[number]
	type FilterValue = ServiceCategory['services'][number] & { categoryId: string; checked: boolean }
	type FormValues = Omit<ServiceCategory, 'services'> & { services: FilterValue[] }

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
	const filterList = formObjectEntryArray.map(([categoryId, services], catIdx) => {
		const checked = hasAll(categoryId)
		const indeterminate = hasSome(categoryId)

		const tsKey = serviceOptionData.find((category) => category.id === categoryId)?.tsKey ?? 'error'
		return (
			<Accordion.Item value={categoryId} key={categoryId} className={classes.item}>
				<Accordion.Control>{t(tsKey, { ns: 'services' })}</Accordion.Control>
				<Accordion.Panel>
					<Checkbox
						checked={checked}
						indeterminate={indeterminate}
						label={t('all-service-category', { serviceCategory: `$t(services:${tsKey})` })}
						transitionDuration={0}
						onChange={() => toggleCategory(categoryId)}
					/>

					{services.map((item, index) => {
						return (
							<Checkbox
								mt='xs'
								ml={33}
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
		for (const [categoryId, services] of Object.entries(form.values)) {
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
			<Group className={modalTitle ? undefined : classes.button} position='apart'>
				<Group spacing='xs'>
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
				{...modalSettings}
				opened={opened}
				onClose={() => setOpened(false)}
				title={<ServiceBar modalTitle />}
				classNames={{
					body: classes.modalBody,
					title: classes.modalTitle,
					header: classes.modalHeader,
					modal: classes.modalModal,
				}}
			>
				<div style={{ overflow: 'scroll' }}>
					<Accordion
						chevron={<Icon icon='carbon:chevron-right' />}
						styles={{ chevron: { '&[data-rotate]': { transform: 'rotate(90deg)' } } }}
						transitionDuration={0}
						classNames={classes}
					>
						<ScrollArea.Autosize maxHeight='calc(60vh - 88px)'>{filterList}</ScrollArea.Autosize>
					</Accordion>
				</div>

				<Box className={classes.footer}>
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
				</Box>
			</Modal>

			<UnstyledButton onClick={() => setOpened(true)} w='100%'>
				<ServiceBar />
			</UnstyledButton>
		</>
	)
}
