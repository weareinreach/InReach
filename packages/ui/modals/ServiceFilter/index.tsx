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
import { useMediaQuery, useViewportSize } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { type BaseSyntheticEvent, type MouseEvent, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Checkbox } from 'react-hook-form-mantine'

import { serviceFilterEvent } from '@weareinreach/analytics/events'
import { Button } from '~ui/components/core/Button'
import { Link } from '~ui/components/core/Link'
import { useSearchState } from '~ui/hooks/useSearchState'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { useAccordionStyles, useModalStyles, useStyles } from './styles'

export const ServiceFilter = ({ resultCount, isFetching, current, disabled }: ServiceFilterProps) => {
	const { data: serviceOptionData } = api.service.getFilterOptions.useQuery(undefined, {
		select: (data) =>
			data.map(({ id, tsKey, tsNs, services }) => ({
				categoryId: id,
				label: `${tsNs}:${tsKey}`,
				services: services.map(({ id, tsKey, tsNs }) => ({ value: id, label: `${tsNs}:${tsKey}` })),
			})),
	})
	const { classes } = useStyles()
	const { classes: accordionClasses } = useAccordionStyles()
	const { classes: modalClasses } = useModalStyles()
	const { t } = useTranslation(['common', 'services'])
	const [opened, setOpened] = useState(false)
	const theme = useMantineTheme()
	const { searchStateActions, searchState } = useSearchState()

	// #region Media Queries
	const isMobileQuery = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`)
	const isLandscape = useMediaQuery(`(orientation: landscape) and (max-height: ${em(430)})`)
	const isSmallLandscape = useMediaQuery(
		`(orientation: landscape) and (max-height: ${em(376)}) and (max-width: ${theme.breakpoints.xs})`
	)
	const isMobile = isMobileQuery || isLandscape
	const viewportHeight = useViewportSize().height + (isLandscape ? (isSmallLandscape ? 40 : 20) : 0)
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

	if (!serviceOptionData) return <Skeleton height={48} width='100%' radius='xs' />

	const hasAll = (categoryId: string) => {
		const services = servicesByCategory.get(categoryId)
		if (!services) return false
		const doesHaveAll = services.every((service) => selectedValues.includes(service))
		return doesHaveAll
	}
	const hasSome = (categoryId: string) => {
		const services = servicesByCategory.get(categoryId)
		if (!services) return false
		return !hasAll(categoryId) && services.some((service) => selectedValues.includes(service))
	}

	const toggleCategory = (categoryId: string) => {
		const services = servicesByCategory.get(categoryId)
		const category = serviceCategoryName.get(categoryId)
		if (!services) return
		if (!hasAll(categoryId)) {
			const newValue = [...new Set([...selectedValues, ...services])]
			for (const service of newValue) {
				if (!selectedValues.includes(service)) {
					serviceFilterEvent.select(service, serviceName.get(service), category)
				}
			}
			form.setValue('selected', newValue, { shouldValidate: true })
		} else {
			const newValue = selectedValues.filter((id) => !services.includes(id))
			if (newValue.length === 0) {
				for (const service of selectedValues) {
					serviceFilterEvent.unselect(service, serviceName.get(service), category)
				}
			}
			for (const service of newValue) {
				if (!selectedValues.includes(service)) {
					serviceFilterEvent.unselect(service, serviceName.get(service), category)
				}
			}
			form.setValue('selected', newValue, { shouldValidate: true })
		}
	}
	const deselectAll = () => {
		serviceFilterEvent.deselectAll(selectedValues.map((serviceId) => serviceName.get(serviceId)))
		for (const service of selectedValues) {
			serviceFilterEvent.unselect(service, serviceName.get(service))
		}
		form.setValue('selected', [], { shouldValidate: true })
	}

	const selectedCountIcon = <Text className={classes.count}>{selectedValues.length}</Text>
	const categorySelectedCountIcon = (categoryId: string) => {
		const services = servicesByCategory.get(categoryId)
		if (!services) return null
		const selectedCount = services.filter((service) => selectedValues.includes(service)).length
		if (selectedCount > 0) return <Text className={classes.count}>{selectedCount}</Text>
		return null
	}

	const filterList = serviceOptionData.map(({ categoryId, label, services }) => {
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
							onClick={() => {
								toggleCategory(categoryId)
								serviceFilterEvent.toggleCategory(
									t(label, { lng: 'en' }),
									checked ? 'unselect' : indeterminate ? 'select_from_partial' : 'select'
								)
							}}
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
									onClick={(e: BaseSyntheticEvent<MouseEvent, HTMLInputElement, { checked: boolean }>) => {
										const serviceId = item.value
										const serviceName = t(item.label, { lng: 'en' })
										const serviceCategory = t(label, { lng: 'en' })
										e.target.checked
											? serviceFilterEvent.select(serviceId, serviceName, serviceCategory)
											: serviceFilterEvent.unselect(serviceId, serviceName, serviceCategory)
									}}
								/>
							)
						})}
					</Checkbox.Group>
				</Accordion.Panel>
			</Accordion.Item>
		)
	})

	const ServiceBar = ({ modalTitle = false }: { modalTitle?: boolean }) => {
		const ServicesDisplay = (props: typeof modalTitle extends true ? TitleProps : TextProps) =>
			modalTitle ? (
				<Title order={2} mb={0} {...props} />
			) : (
				<Text className={classes.label} {...(disabled ? { 'data-disabled': disabled } : {})} {...props} />
			)

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
							{selectedValues.length > 0 ? selectedCountIcon : null}
						</Group>
						{selectedValues.length > 0 ? (
							<Link fw={500} onClick={() => deselectAll()}>
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
						{selectedValues.length > 0 ? (
							selectedCountIcon
						) : (
							<Icon icon='carbon:chevron-down' height={24} width={24} />
						)}
					</>
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
					chevron={<Icon icon='carbon:chevron-right' height={24} width={24} />}
					transitionDuration={0}
					classNames={accordionClasses}
				>
					<ScrollArea.Autosize
						placeholder={null}
						classNames={{ viewport: accordionClasses.scrollArea }}
						mah={scrollAreaMaxHeight}
						// TODO: Typescript wants these two properties all of a sudden -- why?
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						{filterList}
					</ScrollArea.Autosize>
				</Accordion>

				<Group className={modalClasses.footer} noWrap>
					<Button
						variant='secondary'
						onClick={() => deselectAll()}
						disabled={selectedValues.length < 1}
						className={classes.uncheckBtn}
					>
						{t('uncheck-all')}
					</Button>
					<Button
						variant='primary'
						className={classes.resultsBtn}
						onClick={() => setOpened(false)}
						loading={isFetching}
					>
						{t('view-x-result', { count: resultCount })}
					</Button>
				</Group>
			</Modal>

			<UnstyledButton
				onClick={() => setOpened(true)}
				w='100%'
				className={classes.launchButton}
				{...(disabled ? { disabled, 'data-disabled': disabled } : {})}
			>
				<ServiceBar />
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
