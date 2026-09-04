import { zodResolver } from '@hookform/resolvers/zod'
import {
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
	UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { compareArrayVals } from 'crud-object-diff'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { forwardRef, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { Checkbox, Textarea, TextInput } from 'react-hook-form-mantine'
import invariant from 'tiny-invariant'

import { generateId } from '@weareinreach/db/lib/idGen'
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
import { DuplicateServiceModal } from '~ui/modals/dataPortal/DuplicateService'
import { ModalText } from '~ui/modals/Service/ModalText'
import { processAccessInstructions, processAttributes } from '~ui/modals/Service/processor'

import { AttributeEditWrapper } from './AttributeEditWrapper'
import { FormSchema, type TFormSchema } from './schemas'
import { ServiceAreaItem } from './ServiceAreaItem'
import classes from './styles.module.css'
import { InlineTextInput } from '../InlineTextInput'

const isObject = (x: unknown): x is object => typeof x === 'object'

const _ServiceEditDrawer = forwardRef<HTMLButtonElement, ServiceDrawerProps>(
	({ serviceId: passedServiceId, createNew, autoAttachAttributeTag, ...props }, ref) => {
		const { id: organizationId } = useOrgInfo()
		const router = useRouter()
		const serviceId = useMemo(() => passedServiceId ?? generateId('orgService'), [passedServiceId])
		const [drawerOpened, drawerHandler] = useDisclosure(false)
		const [modalOpened, modalHandler] = useDisclosure(false)
		const [hasAttributeChanges, setHasAttributeChanges] = useState(false)
		const [pendingAutoAttach, setPendingAutoAttach] = useState(false)
		const [duplicatedServiceId, setDuplicatedServiceId] = useState<string | null>(null)
		const hasAutoAttachedRef = useRef(false)
		const autoOpenDuplicateRef = useRef<HTMLButtonElement>(null)
		const notifySave = useNewNotification({ displayText: 'Saved', icon: 'success' })
		const notifySaveError = useNewNotification({
			displayText: 'Something went wrong saving this service. Please try again.',
			icon: 'warning',
		})
		const variants = useCustomVariant()
		const { t, i18n } = useTranslation(['common', 'gov-dist'])
		const apiUtils = api.useUtils()

		const { data, error, isPlaceholderData } = api.service.forServiceEditDrawer.useQuery(serviceId, {
			refetchOnWindowFocus: false,
			enabled: !createNew,
			placeholderData: {
				accessDetails: [],
				attributes: [],
				deleted: false,
				emails: [],
				hours: {},
				id: serviceId,
				locations: [],
				phones: [],
				published: false,
				serviceAreas: null,
				services: [],
				// Seeded as `{ text: '' }` rather than `undefined` so the name/description
				// InlineTextInputs start controlled - otherwise they render with value={undefined}
				// until the field is first touched, which trips React's uncontrolled-to-controlled
				// input warning.
				description: { text: '', key: '', ns: '', crowdinId: null },
				name: { text: '', key: '', ns: '', crowdinId: null },
			},
		})

		const isNew = !!createNew && (error?.data?.httpStatus === 404 || isPlaceholderData)
		const attachToLocation = useMemo(
			() => (typeof router.query.orgLocationId === 'string' ? router.query.orgLocationId : undefined),
			[router.query.orgLocationId]
		)
		const form = useForm<TFormSchema>({
			resolver: zodResolver(FormSchema) as Resolver<TFormSchema>,
			// A pre-existing service can predate the name-required rule and have no name set at all -
			// `data.name` reflects that as `undefined`, but the form's `name` field can no longer be:
			// fall back to an empty (still-invalid, still blocked-from-saving) value instead of `undefined`.
			values: data
				? { ...data, name: data.name ?? { text: '' }, organizationId: organizationId ?? '' }
				: undefined,
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

		const { data: allServices } = api.service.getOptions.useQuery(undefined, { refetchOnWindowFocus: false })

		const activeServices = form.watch('services') ?? []
		const nameIsBlank = !form.watch('name.text')?.trim()

		const { data: geoMap } = api.fieldOpt.countryGovDistMap.useQuery(undefined, {
			refetchOnWindowFocus: false,
		})
		const { data: countryMap } = api.fieldOpt.ccaMap.useQuery(
			{ activeForOrgs: true },
			{ refetchOnWindowFocus: false }
		)
		const { data: autoAttachAttributes } = api.fieldOpt.attributesByCategory.useQuery(
			{ attributeActive: true },
			{ enabled: !!autoAttachAttributeTag, refetchOnWindowFocus: false }
		)
		const autoAttachAttributeId = useMemo(
			() =>
				autoAttachAttributes?.find(({ attributeName }) => attributeName === autoAttachAttributeTag)
					?.attributeId,
			[autoAttachAttributes, autoAttachAttributeTag]
		)
		const attachAttribute = api.organization.attachAttribute.useMutation({
			onSuccess: () => {
				apiUtils.service.invalidate()
			},
		})
		const serviceUpsert = api.service.upsert.useMutation({
			onSuccess: () => {
				notifySave()
				apiUtils.location.invalidate()
				apiUtils.service.invalidate()
				if (isNew) {
					apiUtils.service.forServiceEditDrawer.invalidate(serviceId)
					if (autoAttachAttributeTag) {
						setPendingAutoAttach(true)
					}
				}
				if (!isNew) {
					setTimeout(() => {
						drawerHandler.close()
						modalHandler.close()
					}, 500)
				}
				form.reset(form.getValues())
				setHasAttributeChanges(false)
			},
			// Without this, a failed save (network blip, a server-side validation rejection, an
			// expired session, ...) left the UI silently stuck: `onSuccess` never runs, so the form
			// never resets - Save stays enabled and the drawer/"Unsaved Changes" modal never closes -
			// with no indication to the person editing that anything went wrong at all.
			onError: () => {
				notifySaveError()
			},
		})

		useEffect(() => {
			if (pendingAutoAttach && autoAttachAttributeId && !hasAutoAttachedRef.current) {
				hasAutoAttachedRef.current = true
				attachAttribute.mutate({
					id: generateId('attributeSupplement'),
					attributeId: autoAttachAttributeId,
					serviceId,
				})
				setPendingAutoAttach(false)
			}
		}, [pendingAutoAttach, autoAttachAttributeId, attachAttribute, serviceId])

		// Once a duplicate is created, open its own edit drawer automatically via a hidden trigger -
		// this renders a second ServiceEditDrawer instance (referencing the exported, self-contained
		// component below, not a circular import), same shell every other "open a drawer for a real
		// id" call site already uses.
		useEffect(() => {
			if (duplicatedServiceId) {
				autoOpenDuplicateRef.current?.click()
			}
		}, [duplicatedServiceId])

		const hasFormChanges = form.formState.isDirty || hasAttributeChanges

		// The handleSave function is reverted to its correct form
		const handleSave = useCallback(() => {
			const { name, description, ...baseValues } = form.getValues()
			if (!name?.text?.trim()) {
				form.setError('name.text', { type: 'required', message: 'Name is required' })
				return
			}
			const serviceChanges = compareArrayVals<string>([data?.services ?? [], baseValues.services])

			serviceUpsert.mutate({
				...baseValues,
				services: serviceChanges,
				name: name.text,
				description: description?.text,
				attachToLocation,
			})
		}, [attachToLocation, data?.services, form, serviceUpsert])

		const handleCloseAndDiscard = useCallback(() => {
			form.reset()
			setHasAttributeChanges(false)
			drawerHandler.close()
			modalHandler.close()
		}, [drawerHandler, form, modalHandler])
		const handleClose = useCallback(() => {
			if (hasFormChanges) {
				return modalHandler.open()
			} else {
				return drawerHandler.close()
			}
		}, [hasFormChanges, drawerHandler, modalHandler])

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
					<Stack key={key} gap={0}>
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

		const coverageModalSuccessHandler = useCallback(() => {
			apiUtils.service.forServiceEditDrawer.invalidate(serviceId)
			apiUtils.service.forServiceModal.invalidate(serviceId)
			setHasAttributeChanges(true)
		}, [apiUtils, serviceId])
		if (!data && !createNew) {
			return null
		}

		const { getHelp, publicTransit } = data
			? processAccessInstructions({
					accessDetails: data?.accessDetails,
					locations: data?.locations,
					locale: i18n.language,
					t,
				})
			: { getHelp: null, publicTransit: null }

		const attributes = data
			? processAttributes({
					attributes: data.attributes,
					locale: i18n.resolvedLanguage ?? 'en',
					isEditMode: true,
					t,
				})
			: {
					clientsServed: {
						srvfocus: [],
						targetPop: [],
					},
					cost: [],
					atCapacity: false,
					eligibility: {
						requirements: [],
					},
					lang: [],
					misc: [],
					miscWithIcons: [],
				}
		const coverageModalServiceArea = data?.serviceAreas?.id ?? { orgServiceId: serviceId }

		const remainingDrawerBody =
			data && !isNew ? (
				<>
					<Text variant={variants.Text.utility1}>Visibility Status</Text>
					<Group wrap='nowrap'>
						<Checkbox name='published' control={form.control} label='Published' />
						<Checkbox name='deleted' control={form.control} label='Deleted' />
					</Group>
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
					</Stack>
					<Section.Divider title={t('service.get-help')}>
						{hasContactInfo(getHelp) && (
							<ContactInfo passedData={getHelp} direct order={['phone', 'email', 'website']} />
						)}
						{publicTransit?.map(
							(publicTransitProps) => publicTransitProps && <AttributeEditWrapper {...publicTransitProps} />
						)}
						{Boolean(Object.values(data?.hours ?? {}).length) && (
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
								<Stack align='start' gap={0}>
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
				</>
			) : (
				<Text>Click 'Save' to create service and to add further details.</Text>
			)

		return (
			<>
				<Drawer.Root onClose={handleClose} opened={drawerOpened} position='right'>
					<Drawer.Overlay />
					<Drawer.Content className={classes.drawerContent}>
						<Drawer.Header>
							<Stack gap={8} w='100%'>
								<Group justify='space-between' w='100%'>
									<Breadcrumb option='close' onClick={handleClose} />
									<Tooltip
										label={
											hasFormChanges || (!data && isNew)
												? 'Must save other changes first'
												: 'Duplicate this service'
										}
										withArrow
									>
										<Box style={{ display: 'inline-block' }}>
											<DuplicateServiceModal
												sourceServiceId={serviceId}
												onSuccess={setDuplicatedServiceId}
												component={UnstyledButton}
												disabled={hasFormChanges || (!data && isNew)}
											>
												<Icon icon='carbon:copy' height={20} color='black' />
											</DuplicateServiceModal>
										</Box>
									</Tooltip>
								</Group>
								<Group justify='flex-end' w='100%'>
									<Tooltip label='Must save other changes first' disabled={!hasFormChanges} withArrow>
										<Box style={{ display: 'inline-block' }}>
											<AttributeModal
												component={Button}
												variant={variants.Button.secondaryLg}
												leftIcon={<Icon icon='carbon:add-filled' />}
												parentRecord={{ serviceId }}
												attachesTo={['SERVICE']}
												disabled={hasFormChanges || (!data && isNew)}
											>
												Add Attribute
											</AttributeModal>
										</Box>
									</Tooltip>
									<Button
										variant={variants.Button.primaryLg}
										leftIcon={<Icon icon='carbon:save' />}
										loading={serviceUpsert.isPending}
										onClick={handleSave}
										disabled={!hasFormChanges || nameIsBlank}
									>
										Save
									</Button>
								</Group>
							</Stack>
						</Drawer.Header>
						<Drawer.Body className={classes.drawerBody}>
							<Stack>
								<InlineTextInput
									component={TextInput<TFormSchema>}
									label='Service Name'
									name='name.text'
									required
									control={form.control}
									fontSize='h2'
									data-isdirty={dirtyFields.name}
								/>
								<InlineTextInput
									fontSize='utility4'
									component={Textarea<TFormSchema>}
									label='Description'
									name='description.text'
									control={form.control}
									data-isdirty={dirtyFields.description}
									autosize
								/>
								<Stack gap={10}>
									<Text variant={variants.Text.utility1}>Services</Text>
									<ServiceSelect name='services' control={form.control} data-isdirty={dirtyFields.services}>
										<Badge.Group>
											{activeServices.length ? (
												activeServices.map((activeServiceId) => {
													const service = allServices?.find((s) => s.id === activeServiceId)
													if (!service) {
														return null
													}
													return (
														<Badge.Service key={service.id}>
															{t(service.tsKey, { ns: service.tsNs })}
														</Badge.Service>
													)
												})
											) : (
												<Badge.Service>Click to add service tag(s)</Badge.Service>
											)}
										</Badge.Group>
									</ServiceSelect>
								</Stack>
								{remainingDrawerBody}
							</Stack>
						</Drawer.Body>
						<Modal opened={modalOpened} onClose={modalHandler.close} title='Unsaved Changes' zIndex={10002}>
							<Stack align='center'>
								<Text>You have unsaved changes</Text>
								<Group wrap='nowrap'>
									<Button
										variant='primary-icon'
										leftIcon={<Icon icon='carbon:save' />}
										loading={serviceUpsert.isPending}
										onClick={handleSave}
										disabled={!hasFormChanges}
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
				{duplicatedServiceId && (
					<ServiceEditDrawer
						serviceId={duplicatedServiceId}
						ref={autoOpenDuplicateRef}
						style={{ display: 'none' }}
					/>
				)}
				<Stack>
					<Box component='button' onClick={drawerHandler.open} ref={ref} {...props} />
				</Stack>
			</>
		)
	}
)
_ServiceEditDrawer.displayName = 'ServiceEditDrawer'

export const ServiceEditDrawer = createPolymorphicComponent<'button', ServiceDrawerProps>(_ServiceEditDrawer)

interface ServiceEditDrawerProps extends ButtonProps {
	serviceId: string
	createNew?: never
	autoAttachAttributeTag?: never
}
interface ServiceNewDrawerProps extends ButtonProps {
	createNew: true
	serviceId?: never
	/** Attribute tag to attach automatically once the new service is first saved. */
	autoAttachAttributeTag?: string
}
type ServiceDrawerProps = ServiceEditDrawerProps | ServiceNewDrawerProps
