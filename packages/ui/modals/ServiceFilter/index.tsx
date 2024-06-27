import {
	Accordion,
	em,
	Group,
	Modal,
	ScrollArea,
	Skeleton,
	Text,
	type TextProps,
	Title,
	type TitleProps,
	UnstyledButton,
	useMantineTheme,
	Checkbox as VanillaCheckbox,
} from '@mantine/core'
import { useDisclosure, useMediaQuery, useViewportSize } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import {
	type BaseSyntheticEvent,
	type MouseEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
} from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Checkbox } from 'react-hook-form-mantine'

import { serviceFilterEvent } from '@weareinreach/analytics/events'
import { Button } from '~ui/components/core/Button'
import { Link } from '~ui/components/core/Link'
import { useSearchState } from '~ui/hooks/useSearchState'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { useAccordionStyles, useModalStyles, useStyles } from './styles'

const accordionChevron = <Icon icon='carbon:chevron-right' height={24} width={24} />

type ServiceDisplayProps<T extends boolean> = T extends true ? TitleProps : TextProps
const ServicesDisplay = <T extends boolean>({
	modalTitle,
	disabled,
	...props
}: { modalTitle?: T; disabled?: boolean } & ServiceDisplayProps<T>) => {
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

interface ServiceBarProps {
	modalTitle?: boolean
	disabled?: boolean
	selectedItemCount: number
	selectedCountIcon: ReactNode
	deselectAll: () => void
}

const ServiceBar = ({
	modalTitle = false,
	disabled = false,
	selectedItemCount,
	selectedCountIcon,
	deselectAll,
}: ServiceBarProps) => {
	const { classes } = useStyles()
	const { t } = useTranslation('common')

	return (
		<Group
			className={modalTitle ? undefined : classes.button}
			position='apart'
			noWrap
			spacing={0}
			{...(disabled ? { 'data-disabled': disabled } : {})}
		>
			{modalTitle ? (
				<>
					<Group spacing={8} noWrap>
						<ServicesDisplay>{t('filter-by-service')}</ServicesDisplay>
						{selectedItemCount > 0 ? selectedCountIcon : null}
					</Group>
					{selectedItemCount > 0 ? (
						<Link fw={500} onClick={deselectAll}>
							{t('uncheck-all')}
						</Link>
					) : null}
				</>
			) : (
				<>
					<Group spacing={8} noWrap position='center' w='100%'>
						<Icon icon='carbon:building' />
						<ServicesDisplay>{t('filter-by-service')}</ServicesDisplay>
					</Group>
					{selectedItemCount > 0 ? (
						selectedCountIcon
					) : (
						<Icon icon='carbon:chevron-down' height={24} width={24} />
					)}
				</>
			)}
		</Group>
	)
}

export const ServiceFilter = ({ resultCount, isFetching, disabled }: ServiceFilterProps) => {
	const { data: serviceOptionData } = api.service.getFilterOptions.useQuery(undefined, {
		select: (data) =>
			data.map(({ id, tsKey, tsNs, services }) => ({
				categoryId: id,
				label: `${tsNs}:${tsKey}`,
				services: services.map(({ id: serviceId, tsKey: serviceTsKey, tsNs: serviceTsNs }) => ({
					value: serviceId,
					label: `${serviceTsNs}:${serviceTsKey}`,
				})),
			})),
	})
	const { classes } = useStyles()
	const { classes: accordionClasses } = useAccordionStyles()
	const { classes: modalClasses } = useModalStyles()
	const { t } = useTranslation(['common', 'services'])
	const [modalOpen, modalHandler] = useDisclosure(false)
	const theme = useMantineTheme()
	const { searchStateActions, searchState } = useSearchState()

	// #region Media Queries
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
	// #endregion

	const preSelected = searchState.services
	const form = useForm<{ selected: string[] }>({
		values: { selected: preSelected },
	})
	const servicesByCategory = useMemo(
		() =>
			new Map(
				serviceOptionData?.map(({ categoryId, services }) => [categoryId, services.map(({ value }) => value)])
			),
		[serviceOptionData]
	)
	const serviceName = useMemo(() => {
		const data = serviceOptionData?.flatMap(({ services }) =>
			services.map(({ label, value }) => [value, t(label, { lng: 'en' })])
		) as [string, string][] | undefined
		return new Map(data)
	}, [serviceOptionData, t])
	const serviceCategoryName = useMemo(
		() => new Map(serviceOptionData?.map(({ categoryId, label }) => [categoryId, t(label, { lng: 'en' })])),
		[serviceOptionData, t]
	)
	const selectedValues = useWatch({ name: 'selected', control: form.control })

	useEffect(() => {
		searchStateActions.setServices(selectedValues)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedValues])

	const hasAll = useCallback(
		(categoryId: string) => {
			const services = servicesByCategory.get(categoryId)
			if (!services) {
				return false
			}
			const doesHaveAll = services.every((service) => selectedValues.includes(service))
			return doesHaveAll
		},
		[servicesByCategory, selectedValues]
	)
	const hasSome = useCallback(
		(categoryId: string) => {
			const services = servicesByCategory.get(categoryId)
			if (!services) {
				return false
			}
			return !hasAll(categoryId) && services.some((service) => selectedValues.includes(service))
		},
		[servicesByCategory, selectedValues, hasAll]
	)

	const toggleCategory = useCallback(
		(categoryId: string) => {
			const services = servicesByCategory.get(categoryId)
			const category = serviceCategoryName.get(categoryId)
			if (!services) {
				return
			}

			const newValue = !hasAll(categoryId)
				? [...new Set([...selectedValues, ...services])]
				: selectedValues.filter((id) => !services.includes(id))
			if (!hasAll(categoryId)) {
				for (const service of newValue) {
					!selectedValues.includes(service) &&
						serviceFilterEvent.select(service, serviceName.get(service), category)
				}
			} else if (newValue.length === 0) {
				for (const service of selectedValues) {
					serviceFilterEvent.unselect(service, serviceName.get(service), category)
				}
			} else {
				for (const service of newValue) {
					!selectedValues.includes(service) &&
						serviceFilterEvent.unselect(service, serviceName.get(service), category)
				}
			}
			form.setValue('selected', newValue, { shouldValidate: true })
		},
		[servicesByCategory, selectedValues, serviceName, serviceCategoryName, form, hasAll]
	)

	const deselectAll = useCallback(() => {
		serviceFilterEvent.deselectAll(selectedValues.map((serviceId) => serviceName.get(serviceId)))
		for (const service of selectedValues) {
			serviceFilterEvent.unselect(service, serviceName.get(service))
		}
		form.setValue('selected', [], { shouldValidate: true })
	}, [form, serviceName, selectedValues])

	const getToggleAction = useCallback((checked: boolean, indeterminate: boolean) => {
		if (checked) {
			return 'unselect'
		}
		if (indeterminate) {
			return 'select_from_partial'
		}
		return 'select'
	}, [])

	const handleToggleParent = useCallback(
		({
			categoryId,
			label,
			checked,
			indeterminate,
		}: {
			categoryId: string
			label: string
			checked: boolean
			indeterminate: boolean
		}) =>
			() => {
				const toggleAction = getToggleAction(checked, indeterminate)
				toggleCategory(categoryId)
				serviceFilterEvent.toggleCategory(t(label, { lng: 'en' }), toggleAction)
			},
		[getToggleAction, toggleCategory, t]
	)

	const handleToggleChild = useCallback(
		(item: { value: string; label: string }, parentLabel: string) =>
			(e: BaseSyntheticEvent<MouseEvent, HTMLInputElement, { checked: boolean }>) => {
				const serviceId = item.value
				const serviceItemName = t(item.label, { lng: 'en' })
				const serviceCategory = t(parentLabel, { lng: 'en' })
				e.target.checked
					? serviceFilterEvent.select(serviceId, serviceItemName, serviceCategory)
					: serviceFilterEvent.unselect(serviceId, serviceItemName, serviceCategory)
			},
		[t]
	)

	const categorySelectedCountIcon = (categoryId: string) => {
		const services = servicesByCategory.get(categoryId)
		if (!services) {
			return null
		}
		const selectedCount = services.filter((service) => selectedValues.includes(service)).length
		if (selectedCount > 0) {
			return <Text className={classes.count}>{selectedCount}</Text>
		}
		return null
	}

	const filterList = serviceOptionData?.map(({ categoryId, label, services }) => {
		const checked = hasAll(categoryId)
		const indeterminate = hasSome(categoryId)

		return (
			<Accordion.Item value={categoryId} key={categoryId}>
				<Accordion.Control>
					<Group noWrap position='apart'>
						{t(label)}
						{categorySelectedCountIcon(categoryId)}
					</Group>
				</Accordion.Control>
				<Accordion.Panel>
					{services.length > 1 && (
						<VanillaCheckbox
							checked={checked}
							indeterminate={indeterminate}
							label={t('all-service-category', { serviceCategory: `$t(${label})` })}
							transitionDuration={0}
							onChange={handleToggleParent({ categoryId, label, checked, indeterminate })}
							className={classes.itemParent}
						/>
					)}
					<Checkbox.Group name='selected' control={form.control}>
						{services.map((item) => {
							return (
								<Checkbox.Item
									className={classes.itemChild}
									label={t(item.label)}
									value={item.value}
									key={item.value}
									onClick={handleToggleChild(item, label)}
								/>
							)
						})}
					</Checkbox.Group>
				</Accordion.Panel>
			</Accordion.Item>
		)
	})

	const selectedCountIcon = useMemo(
		() => <Text className={classes.count}>{selectedValues.length}</Text>,
		[selectedValues.length, classes]
	)
	const serviceBarProps: ServiceBarProps = useMemo(
		() => ({
			disabled,
			selectedCountIcon,
			deselectAll,
			selectedItemCount: selectedValues.length,
		}),
		[disabled, selectedCountIcon, deselectAll, selectedValues.length]
	)
	const modalTitle = useMemo(() => <ServiceBar modalTitle {...serviceBarProps} />, [serviceBarProps])
	if (!serviceOptionData) {
		return <Skeleton height={48} width='100%' radius='xs' />
	}
	return (
		<>
			<Modal
				opened={modalOpen}
				onClose={modalHandler.close}
				title={modalTitle}
				fullScreen={isMobile}
				classNames={modalClasses}
				scrollAreaComponent={Modal.NativeScrollArea}
			>
				<Accordion chevron={accordionChevron} transitionDuration={0} classNames={accordionClasses}>
					<ScrollArea.Autosize
						placeholder={null}
						classNames={{ viewport: accordionClasses.scrollArea }}
						mah={scrollAreaMaxHeight}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						{filterList}
					</ScrollArea.Autosize>
				</Accordion>

				<Group className={modalClasses.footer} noWrap>
					<Button
						variant='secondary'
						onClick={deselectAll}
						disabled={selectedValues.length < 1}
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

			<UnstyledButton
				onClick={modalHandler.open}
				w='100%'
				className={classes.launchButton}
				{...(disabled ? { disabled, 'data-disabled': disabled } : {})}
			>
				<ServiceBar {...serviceBarProps} />
			</UnstyledButton>
		</>
	)
}
interface ServiceFilterProps {
	resultCount?: number
	isFetching?: boolean
	current?: string[]
	disabled?: boolean
}
