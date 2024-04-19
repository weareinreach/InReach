import { zodResolver } from '@hookform/resolvers/zod'
import {
	ActionIcon,
	Box,
	type ButtonProps,
	createPolymorphicComponent,
	Drawer,
	Group,
	List,
	Modal,
	Stack,
	Text,
	Title,
	Tooltip,
	useMantineTheme,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { compareArrayVals } from 'crud-object-diff'
import { useTranslation } from 'next-i18next'
import { forwardRef, type ReactNode, useCallback, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Textarea, TextInput } from 'react-hook-form-mantine'
import invariant from 'tiny-invariant'

import { Badge } from '~ui/components/core/Badge'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { Section } from '~ui/components/core/Section'
import { ContactInfo, hasContactInfo } from '~ui/components/data-display/ContactInfo'
import { Hours } from '~ui/components/data-display/Hours'
import { ServiceSelect } from '~ui/components/data-portal/ServiceSelect'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { CoverageArea } from '~ui/modals/CoverageArea'
import { AttributeModal } from '~ui/modals/dataPortal/Attributes'
import { ModalText } from '~ui/modals/Service/ModalText'
import { processAccessInstructions, processAttributes } from '~ui/modals/Service/processor'

import { FormSchema, type TFormSchema } from './schemas'
import { useStyles } from './styles'
import { InlineTextInput } from '../InlineTextInput'

const isObject = (x: unknown): x is object => typeof x === 'object'

const ServiceAreaItem = ({
	serviceId,
	serviceAreaId,
	countryId,
	govDistId,
	children,
}: ServiceAreaItemProps) => {
	const apiUtils = api.useUtils()
	const removeServiceArea = api.serviceArea.delFromArea.useMutation({
		onSuccess: () => apiUtils.service.forServiceEditDrawer.invalidate(serviceId),
	})

	const actionHandler = useCallback(() => {
		if (serviceAreaId) {
			removeServiceArea.mutate({ serviceAreaId, countryId, govDistId })
		}
	}, [countryId, govDistId, removeServiceArea, serviceAreaId])

	if (!serviceAreaId || !(countryId || govDistId)) {
		return children
	}

	return (
		<Group noWrap spacing={0}>
			<Tooltip label='Delete'>
				<ActionIcon onClick={actionHandler}>
					<Icon icon='carbon:trash-can' />
				</ActionIcon>
			</Tooltip>
			{children}
		</Group>
	)
}

const AttributeEditWrapper = ({ active, id, children, editable }: AttributeEditWrapperProps) => {
	const theme = useMantineTheme()
	const [confirmModalOpen, confirmModalHandler] = useDisclosure(false)
	const apiUtils = api.useUtils()
	const toggleOrDeleteAttribute = api.component.AttributeEditWrapper.useMutation({
		onSuccess: () => apiUtils.service.forServiceEditDrawer.invalidate(),
	})
	const handleToggle = useCallback(
		() => toggleOrDeleteAttribute.mutate({ id, action: 'toggleActive' }),
		[id, toggleOrDeleteAttribute]
	)
	const handleDelete = useCallback(
		() => toggleOrDeleteAttribute.mutate({ id, action: 'delete' }),
		[id, toggleOrDeleteAttribute]
	)
	const handleEdit = useCallback(() => {
		alert('To be implemented later')
	}, [])
	const editIcon = useMemo(() => {
		if (editable) {
			return (
				<Tooltip label='Edit'>
					<ActionIcon onClick={handleEdit}>
						<Icon icon='carbon:edit' color={theme.other.colors.secondary.black} />
					</ActionIcon>
				</Tooltip>
			)
		}
		return (
			<Tooltip label='Not Editable'>
				<ActionIcon disabled>
					<Icon icon='carbon:edit-off' />
				</ActionIcon>
			</Tooltip>
		)
	}, [editable, handleEdit, theme.other.colors.secondary.black])

	const activeToggleIcon = useMemo(() => {
		if (active) {
			return (
				<Tooltip label='Deactivate'>
					<ActionIcon onClick={handleToggle}>
						<Icon icon='carbon:view' color={theme.other.colors.secondary.black} />
					</ActionIcon>
				</Tooltip>
			)
		}
		return (
			<Tooltip label='Activate'>
				<ActionIcon onClick={handleToggle}>
					<Icon icon='carbon:view-off' color={theme.other.colors.secondary.darkGray} />
				</ActionIcon>
			</Tooltip>
		)
	}, [active, handleToggle, theme.other.colors.secondary.black, theme.other.colors.secondary.darkGray])

	return (
		<Group noWrap spacing={8}>
			<Group noWrap spacing={0}>
				{editIcon}
				{activeToggleIcon}
				<Modal opened={confirmModalOpen} onClose={confirmModalHandler.close} title='Delete Attribute'>
					<Text>Are you sure you want to delete this attribute?</Text>
					<Group noWrap>
						<Button onClick={confirmModalHandler.close}>Cancel</Button>
						<Button onClick={handleDelete}>Delete</Button>
					</Group>
				</Modal>
				<Tooltip label='Delete'>
					<ActionIcon onClick={confirmModalHandler.open}>
						<Icon icon='carbon:trash-can' color={theme.other.colors.secondary.black} />
					</ActionIcon>
				</Tooltip>
			</Group>
			{typeof children === 'string' ? <ModalText>{children}</ModalText> : children}
		</Group>
	)
}

interface AttributeEditWrapperProps {
	id: string
	children: ReactNode
	active: boolean
	editable?: boolean
}

const _ServiceEditDrawer = forwardRef<HTMLButtonElement, ServiceEditDrawerProps>(
	({ serviceId, ...props }, ref) => {
		const { id: organizationId } = useOrgInfo()
		const [drawerOpened, drawerHandler] = useDisclosure(false)
		const [modalOpened, modalHandler] = useDisclosure(false)
		const notifySave = useNewNotification({ displayText: 'Saved', icon: 'success' })
		const { classes } = useStyles()
		const variants = useCustomVariant()
		const { t, i18n } = useTranslation(['common', 'gov-dist'])
		const apiUtils = api.useUtils()
		// #region Get existing data/populate form
		const { data } = api.service.forServiceEditDrawer.useQuery(serviceId, {
			refetchOnWindowFocus: false,
		})
		const form = useForm<TFormSchema>({
			resolver: zodResolver(FormSchema),
			values: data ? { ...data, organizationId: organizationId ?? '' } : undefined,
		})

		useEffect(() => {
			if (organizationId && organizationId !== form.getValues().organizationId) {
				form.setValue('organizationId', organizationId)
			}
		}, [form, organizationId])

		const dirtyFields = {
			name: isObject(form.formState.dirtyFields.name) ? form.formState.dirtyFields.name.text : false,
			description: isObject(form.formState.dirtyFields.description)
				? form.formState.dirtyFields.description.text
				: false,
			services: form.formState.dirtyFields.services ?? false,
		}

		// #endregion

		// #region Get all available service options & filter selected
		const { data: allServices } = api.service.getOptions.useQuery(undefined, { refetchOnWindowFocus: false })

		const activeServices = form.watch('services') ?? []

		// #endregion

		// #region Get service area options
		const { data: geoMap } = api.fieldOpt.countryGovDistMap.useQuery(undefined, {
			refetchOnWindowFocus: false,
		})
		const { data: countryMap } = api.fieldOpt.ccaMap.useQuery(
			{ activeForOrgs: true },
			{ refetchOnWindowFocus: false }
		)
		const serviceUpsert = api.service.upsert.useMutation({
			onSuccess: () => {
				apiUtils.location.forLocationPageEdits.invalidate()
				apiUtils.service.invalidate()
				notifySave()
				setTimeout(() => {
					drawerHandler.close()
					modalHandler.close()
				}, 500)
			},
		})

		const handleSave = useCallback(() => {
			const { name, description, ...baseValues } = form.getValues()
			const serviceChanges = compareArrayVals<string>([data?.services ?? [], baseValues.services])

			serviceUpsert.mutate({
				...baseValues,
				services: serviceChanges,
				name: name?.text,
				description: description?.text,
			})
		}, [data?.services, form, serviceUpsert])
		const handleCloseAndDiscard = useCallback(() => {
			form.reset()
			drawerHandler.close()
			modalHandler.close()
		}, [drawerHandler, form, modalHandler])
		const handleClose = useCallback(() => {
			if (form.formState.isDirty) {
				return modalHandler.open()
			} else {
				return drawerHandler.close()
			}
		}, [form, drawerHandler, modalHandler])

		const serviceAreas = useMemo(() => {
			const countryTranslation = new Intl.DisplayNames(i18n.language, { type: 'region' })
			const serviceAreaObj: Record<string, ReactNode[]> = {}

			const { countries, districts } = data?.serviceAreas ?? {}
			if (!geoMap) {
				return null
			}
			const countryIdRegex = /^ctry_.*/
			const distIdRegex = /^gdst_.*/

			const processCountry = (countryId: string) => {
				serviceAreaObj[countryId] ??= []
				const array = serviceAreaObj[countryId]
				invariant(array)
				const cca2 = countryMap?.byId.get(countryId)
				if (!cca2) {
					return
				}
				const serviceAreaId = data?.serviceAreas?.id
				const item = (
					<List.Item key={countryId}>
						<ServiceAreaItem {...{ serviceId, serviceAreaId, countryId }}>
							<Text variant={variants.Text.utility4}>All of {countryTranslation.of(cca2)}</Text>
						</ServiceAreaItem>
					</List.Item>
				)
				array.push(item)
			}
			const processDistrict = (govDistId: string) => {
				const govDist = geoMap.get(govDistId)
				const country = govDist?.parent?.parent?.id ?? govDist?.parent?.id ?? ''
				if (!countryIdRegex.test(country) || !govDist) {
					return
				}
				serviceAreaObj[country] ??= []
				const array = serviceAreaObj[country]
				invariant(array)
				const parent = govDist.parent?.id ?? ''
				const parentDist = geoMap.get(parent)
				const serviceAreaId = data?.serviceAreas?.id
				const item = (
					<List.Item key={govDistId}>
						<ServiceAreaItem {...{ serviceId, serviceAreaId, govDistId }}>
							<Text variant={variants.Text.utility4}>
								{!distIdRegex.test(parent) || !parentDist
									? t(govDist.tsKey, { ns: govDist.tsNs })
									: `${t(parentDist.tsKey, { ns: parentDist.tsNs })} - ${t(govDist.tsKey, { ns: govDist.tsNs })}`}
							</Text>
						</ServiceAreaItem>
					</List.Item>
				)

				array.push(item)
			}

			if (countries?.length) {
				for (const country of countries) {
					processCountry(country)
				}
			}
			if (districts?.length) {
				for (const district of districts) {
					processDistrict(district)
				}
			}
			return Object.entries(serviceAreaObj)?.map(([key, value]) => {
				const country = countryMap?.byId.get(key)
				if (!country) {
					return null
				}
				return (
					<Stack key={key} spacing={0}>
						<Title order={3}>{countryTranslation.of(country)}</Title>
						<List className={classes.badgeGroup} listStyleType='none'>
							{value}
						</List>
					</Stack>
				)
			})
		}, [
			classes.badgeGroup,
			countryMap?.byId,
			data?.serviceAreas,
			geoMap,
			i18n.language,
			serviceId,
			t,
			variants.Text.utility4,
		])

		// #endregion
		const coverageModalSuccessHandler = useCallback(() => {
			apiUtils.service.forServiceEditDrawer.invalidate(serviceId)
			apiUtils.service.forServiceModal.invalidate(serviceId)
		}, [apiUtils.service.forServiceEditDrawer, apiUtils.service.forServiceModal, serviceId])
		if (!data) {
			return null
		}

		const { getHelp, publicTransit } = data
			? processAccessInstructions({
					accessDetails: data?.accessDetails,
					locations: data?.locations,
					t,
					locale: i18n.language,
				})
			: { getHelp: null, publicTransit: null }

		const attributes = processAttributes({
			attributes: data.attributes,
			locale: i18n.resolvedLanguage ?? 'en',
			isEditMode: true,
			t,
		})
		const coverageModalServiceArea = data.serviceAreas?.id ?? { orgServiceId: serviceId }

		return (
			<>
				<Drawer.Root onClose={handleClose} opened={drawerOpened} position='right'>
					<Drawer.Overlay />
					<Drawer.Content className={classes.drawerContent}>
						<Drawer.Header>
							<Group position='apart' w='100%'>
								<Breadcrumb option='close' onClick={handleClose} />
								<Group>
									<AttributeModal
										component={Button}
										variant={variants.Button.secondaryLg}
										leftIcon={<Icon icon='carbon:add-filled' />}
										parentRecord={{ serviceId: data.id }}
										attachesTo={['SERVICE']}
									>
										Add Attribute
									</AttributeModal>
									<Button
										variant={variants.Button.primaryLg}
										leftIcon={<Icon icon='carbon:save' />}
										loading={serviceUpsert.isLoading}
										onClick={handleSave}
									>
										Save
									</Button>
								</Group>
							</Group>
						</Drawer.Header>
						<Drawer.Body className={classes.drawerBody}>
							<Stack>
								<InlineTextInput
									component={TextInput<TFormSchema>}
									label='Service Name'
									name='name.text'
									control={form.control}
									fontSize='h2'
									data-isDirty={dirtyFields.name}
								/>
								<InlineTextInput
									fontSize='utility4'
									component={Textarea<TFormSchema>}
									label='Description'
									name='description.text'
									control={form.control}
									data-isDirty={dirtyFields.description}
									autosize
								/>
								<Stack spacing={10}>
									<Text variant={variants.Text.utility1}>Services</Text>
									<ServiceSelect name='services' control={form.control} data-isDirty={dirtyFields.services}>
										<Badge.Group>
											{activeServices.map((activeServiceId) => {
												const service = allServices?.find((s) => s.id === activeServiceId)
												if (!service) {
													return null
												}
												return (
													<Badge.Service key={service.id}>
														{t(service.tsKey, { ns: service.tsNs })}
													</Badge.Service>
												)
											})}
										</Badge.Group>
									</ServiceSelect>
								</Stack>

								<Text variant={variants.Text.utility1}>Coverage Area</Text>
								<Stack className={classes.dottedCard}>
									{serviceAreas}
									<CoverageArea
										serviceArea={coverageModalServiceArea}
										onSuccessAction={coverageModalSuccessHandler}
										component={Button}
										variant={variants.Button.secondarySm}
									>
										Add new service area
									</CoverageArea>
									{/* {Boolean(geoMap?.size) && } */}
								</Stack>
								<Section.Divider title={t('service.get-help')}>
									{hasContactInfo(getHelp) && (
										<ContactInfo passedData={getHelp} direct order={['phone', 'email', 'website']} />
									)}
									{publicTransit?.map(
										(publicTransitProps) =>
											publicTransitProps && <AttributeEditWrapper {...publicTransitProps} />
									)}
									{Boolean(Object.values(data.hours).length) && (
										<Hours parentId={serviceId} label='service' data={data.hours} />
									)}
								</Section.Divider>
								<Section.Divider title={t('service.clients-served')}>
									<Section.Sub title={t('service.community-focus')}>
										{attributes.clientsServed.srvfocus.map(({ childProps, ...wrapperProps }) => (
											<AttributeEditWrapper key={wrapperProps.id} {...wrapperProps}>
												<Badge.Community {...childProps} />
											</AttributeEditWrapper>
										))}
									</Section.Sub>
									<Section.Sub title={t('service.target-population')}>
										{attributes.clientsServed.targetPop.map(({ childProps, ...wrapperProps }) => (
											<AttributeEditWrapper key={wrapperProps.id} {...wrapperProps}>
												<ModalText {...childProps} />
											</AttributeEditWrapper>
										))}
									</Section.Sub>
								</Section.Divider>
								<Section.Divider title={t('service.cost')}>
									{attributes.cost.map(({ badgeProps, detailProps, ...wrapperProps }) => (
										<AttributeEditWrapper key={wrapperProps.id} {...wrapperProps}>
											<Stack align='start' spacing={0}>
												{badgeProps && <Badge.Attribute {...badgeProps} />}
												{detailProps && <ModalText {...detailProps} />}
											</Stack>
										</AttributeEditWrapper>
									))}
								</Section.Divider>
								<Section.Divider title={t('service.eligibility')}>
									<Section.Sub title={t('service.ages')}>
										{attributes.eligibility.age && (
											<AttributeEditWrapper
												key={attributes.eligibility.age.id}
												id={attributes.eligibility.age.id}
												active={attributes.eligibility.age.active}
												editable
											>
												<ModalText>{attributes.eligibility.age.children}</ModalText>
											</AttributeEditWrapper>
										)}
									</Section.Sub>
									<Section.Sub title={t('service.requirements')}>
										{attributes.eligibility.requirements.map(({ childProps, ...wrapperProps }) => (
											<AttributeEditWrapper key={wrapperProps.id} {...wrapperProps}>
												{childProps.children}
											</AttributeEditWrapper>
										))}
									</Section.Sub>
								</Section.Divider>
								<Section.Divider title={t('service.languages')}>
									<Section.Sub title={t('service.languages')}>
										{attributes.lang.map(({ childProps, ...wrapperProps }) => (
											<AttributeEditWrapper key={wrapperProps.id} {...wrapperProps}>
												<ModalText {...childProps} />
											</AttributeEditWrapper>
										))}
									</Section.Sub>
								</Section.Divider>
								<Section.Divider title={t('service.extra-info')}>
									<Section.Sub key='miscbadges'>
										<Badge.Group withSeparator={false}>
											{attributes.miscWithIcons.map(
												({ badgeProps, ...wrapperProps }) =>
													badgeProps && (
														<AttributeEditWrapper key={wrapperProps.id} {...wrapperProps}>
															<Badge.Attribute {...badgeProps} />
														</AttributeEditWrapper>
													)
											)}
										</Badge.Group>
									</Section.Sub>
									<Section.Sub key='misc' title={t('service.additional-info')}>
										{attributes.misc.map(
											({ detailProps, ...wrapperProps }) =>
												detailProps && (
													<AttributeEditWrapper key={wrapperProps.id} {...wrapperProps}>
														{detailProps.children}
													</AttributeEditWrapper>
												)
										)}
									</Section.Sub>
								</Section.Divider>
							</Stack>
						</Drawer.Body>
						<Modal opened={modalOpened} onClose={modalHandler.close} title='Unsaved Changes' zIndex={10002}>
							<Stack align='center'>
								<Text>You have unsaved changes</Text>
								<Group noWrap>
									<Button
										variant='primary-icon'
										leftIcon={<Icon icon='carbon:save' />}
										loading={serviceUpsert.isLoading}
										onClick={handleSave}
									>
										Save
									</Button>
									<Button variant='secondaryLg' onClick={handleCloseAndDiscard}>
										Discard
									</Button>
								</Group>
							</Stack>
						</Modal>
					</Drawer.Content>
				</Drawer.Root>
				<Stack>
					<Box component='button' onClick={drawerHandler.open} ref={ref} {...props} />
				</Stack>
			</>
		)
	}
)
_ServiceEditDrawer.displayName = 'ServiceEditDrawer'

export const ServiceEditDrawer = createPolymorphicComponent<'button', ServiceEditDrawerProps>(
	_ServiceEditDrawer
)

interface ServiceEditDrawerProps extends ButtonProps {
	serviceId: string
}

interface ServiceAreaItemProps {
	serviceId: string
	serviceAreaId?: string
	countryId?: string
	govDistId?: string
	children: ReactNode
}
