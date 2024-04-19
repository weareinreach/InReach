import {
	Box,
	type ButtonProps,
	createPolymorphicComponent,
	List,
	Modal,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { forwardRef, useCallback, useMemo } from 'react'

import { serviceModalEvent } from '@weareinreach/analytics/events'
import { AlertMessage } from '~ui/components/core/AlertMessage'
import { Badge } from '~ui/components/core/Badge'
import { Section } from '~ui/components/core/Section'
import { ContactInfo, hasContactInfo, Hours } from '~ui/components/data-display'
import { useScreenSize } from '~ui/hooks/useScreenSize'
import { useSlug } from '~ui/hooks/useSlug'
import { trpc as api } from '~ui/lib/trpcClient'

import { ModalText } from './ModalText'
import { processAccessInstructions, processAttributes } from './processor'
import { ModalTitle, type ModalTitleProps } from '../ModalTitle'

const ServiceModalTitle = ({ handler, isMobile, serviceId, slug }: ServiceModalTitleProps) => {
	const icons = ['share', 'save'] satisfies ModalTitleProps['icons']
	const router = useRouter<'/org/[slug]' | '/org/[slug]/[orgLocationId]'>()
	const { orgLocationId } = router.query
	const apiQuery = typeof orgLocationId === 'string' ? { orgLocationId } : { slug }
	const { data, status } = api.service.getParentName.useQuery(apiQuery)

	if (isMobile || status === 'loading') {
		return (
			<ModalTitle breadcrumb={{ option: 'back', backTo: 'none', onClick: handler.close }} icons={icons} />
		)
	}

	if (data && status === 'success') {
		return (
			<ModalTitle
				breadcrumb={{
					option: 'back',
					backTo: 'dynamicText',
					backToText: data.name as string,
					onClick: handler.close,
				}}
				icons={icons}
				serviceId={serviceId}
			/>
		)
	}

	return (
		<ModalTitle
			breadcrumb={{
				option: 'back',
				backTo: 'dynamicText',
				backToText: '...',
				onClick: handler.close,
			}}
			icons={icons}
		/>
	)
}
interface ServiceModalTitleProps {
	handler: ReturnType<typeof useDisclosure>[1]
	isMobile: boolean
	serviceId: string
	slug: string
}

/**
 * TODO: [IN-797] Service Modal updates
 *
 * - Fix 'at capacity' layout/spacing
 * - Community focus to use badges with short name & icon
 * - Cost to use attribute badge
 * - Validate data display against finalized data structure.
 */

const ServiceModalBody = forwardRef<HTMLButtonElement, ServiceModalProps>(({ serviceId, ...props }, ref) => {
	const slug = useSlug()
	const { data, status } = api.service.forServiceModal.useQuery(serviceId)
	const { data: orgId } = api.organization.getIdFromSlug.useQuery({ slug })
	const { t, i18n } = useTranslation(orgId?.id ? ['common', 'attribute', orgId.id] : ['common', 'attribute'])
	const [opened, handler] = useDisclosure(false)
	const { isMobile } = useScreenSize()

	const modalTitle = useMemo(
		() => <ServiceModalTitle {...{ handler, isMobile, serviceId, slug }} />,
		[handler, isMobile, serviceId, slug]
	)

	const handleOpen = useCallback(() => {
		serviceModalEvent.opened({ serviceId, serviceName: data?.serviceName?.tsKey?.text, orgSlug: slug })
		handler.open()
	}, [data?.serviceName?.tsKey?.text, handler, serviceId, slug])
	const serviceBadges = useMemo(
		() =>
			data?.services?.length !== 0 ? (
				<Badge.Group>
					{data?.services.map(({ tag }) => (
						<Badge.Service key={tag.tsKey}>{t(tag.tsKey, { ns: 'services' })}</Badge.Service>
					))}
				</Badge.Group>
			) : null,
		[data?.services, t]
	)

	const { getHelp, publicTransit } = useMemo(() => {
		if (data) {
			const { accessDetails, locations } = data
			return processAccessInstructions({ accessDetails, locations, t, locale: i18n.language })
		}
		return { getHelp: null, publicTransit: null }
	}, [data, i18n.language, t])

	const { eligibility, clientsServed, cost, lang, misc, miscWithIcons, atCapacity } = useMemo(() => {
		if (data) {
			const { attributes } = data
			return processAttributes({
				attributes,
				t,
				locale: i18n.language,
			})
		}
		return {
			eligibility: null,
			clientsServed: null,
			cost: null,
			lang: null,
			misc: null,
			miscWithIcons: null,
			atCapacity: null,
		}
	}, [data, t, i18n.language])

	const basicInfoSection = useMemo(() => {
		if (!data) {
			return null
		}
		const { serviceName, description } = data
		return (
			<Stack spacing={16}>
				{atCapacity && <AlertMessage textKey={'service.at-capacity'} iconKey='information' />}
				{serviceName && (
					<Title order={2}>
						{t(serviceName.key, { ns: orgId?.id, defaultValue: serviceName.tsKey.text })}
					</Title>
				)}
				{description && (
					<Text>{t(description.key, { ns: orgId?.id, defaultValue: description.tsKey.text })}</Text>
				)}
			</Stack>
		)
	}, [atCapacity, data, orgId?.id, t])

	const getHelpSection = useMemo(
		() =>
			hasContactInfo(getHelp) || Boolean(data?.hours.length) ? (
				<Section.Divider title={t('service.get-help')}>
					{hasContactInfo(getHelp) && (
						<ContactInfo passedData={getHelp} direct order={['phone', 'email', 'website']} />
					)}
					{Boolean(data?.hours.length) && <Hours parentId={serviceId} label='service' />}
				</Section.Divider>
			) : null,
		[data?.hours.length, getHelp, serviceId, t]
	)

	const clientsServedSection = useMemo(
		() =>
			Boolean(clientsServed?.srvfocus.length) || Boolean(clientsServed?.targetPop.length) ? (
				<Section.Divider title={t('service.clients-served')}>
					{Boolean(clientsServed?.srvfocus.length) && (
						<Section.Sub title={t('service.community-focus')}>
							<Badge.Group withSeparator={false}>
								{clientsServed?.srvfocus.map(({ childProps, id }) => (
									<Badge.Community key={id} {...childProps} />
								))}
							</Badge.Group>
						</Section.Sub>
					)}
					{Boolean(clientsServed?.targetPop.length) && (
						<Section.Sub title={t('service.target-population')}>
							{clientsServed?.targetPop.map(({ id, childProps }) => <ModalText key={id} {...childProps} />)}
						</Section.Sub>
					)}
				</Section.Divider>
			) : null,
		[clientsServed?.srvfocus, clientsServed?.targetPop, t]
	)

	const costSection = useMemo(
		() => (
			<Section.Divider title={t('service.cost')}>
				{cost?.map(({ id, badgeProps, detailProps }) => (
					<Stack key={id} align='start'>
						{badgeProps && <Badge.Attribute {...badgeProps} />}
						{detailProps && (
							<Section.Sub title={t('service.cost-details')}>
								<ModalText {...detailProps} />
							</Section.Sub>
						)}
					</Stack>
				))}
			</Section.Divider>
		),
		[cost, t]
	)

	const eligibilitySection = useMemo(() => {
		if (!eligibility) {
			return null
		}
		return (
			<Section.Divider title={t('service.eligibility')}>
				{eligibility.age && (
					<Section.Sub key='ages' title={t('service.ages')}>
						<ModalText>{eligibility.age.children}</ModalText>
					</Section.Sub>
				)}
				{Boolean(eligibility.requirements.length) && (
					<Section.Sub key='req' title={t('service.requirements')}>
						<List>
							{eligibility.requirements.map(({ id, childProps }) => (
								<List.Item key={id} {...childProps} />
							))}
						</List>
					</Section.Sub>
				)}
			</Section.Divider>
		)
	}, [eligibility, t])

	const languageSection = useMemo(
		() => (
			<Section.Divider title={t('service.languages')}>
				{lang ? (
					<Section.Sub title={t('service.languages')}>
						<List>
							{lang.map(({ id, childProps }) => (
								<List.Item key={id} {...childProps} />
							))}
						</List>
					</Section.Sub>
				) : null}
			</Section.Divider>
		),
		[lang, t]
	)

	const additionalInfoSection = useMemo(
		() => (
			<Section.Divider title={t('service.additional-info')}>
				{Boolean(miscWithIcons?.length) && (
					<Section.Sub key='miscbadges'>
						<Badge.Group withSeparator={false}>
							{miscWithIcons?.map(
								({ id, badgeProps }) => badgeProps && <Badge.Attribute key={id} {...badgeProps} />
							)}
						</Badge.Group>
					</Section.Sub>
				)}
				{Boolean(misc?.length) && (
					<Section.Sub key='misc'>
						<List>
							{misc?.map(({ id, detailProps }) => detailProps && <List.Item key={id} {...detailProps} />)}
						</List>
					</Section.Sub>
				)}
			</Section.Divider>
		),
		[misc, miscWithIcons, t]
	)

	const publicTransitSection = useMemo(
		() => (
			<Section.Divider title={t('service.transit-directions')}>
				{publicTransit?.map(({ id, children }) => <ModalText key={id}>{children}</ModalText>)}
			</Section.Divider>
		),
		[publicTransit, t]
	)

	const modalLaunchPoint = useMemo(() => {
		if (data && status === 'success') {
			return <Box component='button' ref={ref} onClick={handleOpen} {...props} />
		}
		return <Box component='button' ref={ref} style={{ cursor: 'wait' }} {...props} />
	}, [data, handleOpen, props, ref, status])

	return (
		<>
			<Modal title={modalTitle} opened={opened} onClose={handler.close} fullScreen={isMobile} withinPortal>
				<Stack spacing={24}>
					{basicInfoSection}
					{serviceBadges}
					{getHelpSection}
					{clientsServedSection}
					{costSection}
					{eligibilitySection}
					{languageSection}
					{additionalInfoSection}
					{publicTransitSection}
				</Stack>
			</Modal>
			{modalLaunchPoint}
		</>
	)
})
ServiceModalBody.displayName = 'ServiceModal'

export const ServiceModal = createPolymorphicComponent<'button', ServiceModalProps>(ServiceModalBody)
export interface ServiceModalProps extends ButtonProps {
	serviceId: string
}
