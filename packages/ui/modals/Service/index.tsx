import {
	Box,
	type ButtonProps,
	createPolymorphicComponent,
	List,
	Modal,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { forwardRef, type ReactNode } from 'react'

import { serviceModalEvent } from '@weareinreach/analytics/events'
import { Badge } from '~ui/components/core/Badge'
import { Section } from '~ui/components/core/Section'
import { ContactInfo, hasContactInfo, Hours } from '~ui/components/data-display'
import { useSlug } from '~ui/hooks/useSlug'
import { trpc as api } from '~ui/lib/trpcClient'

import { processAccessInstructions, processAttributes } from './processor'
import { ModalTitle, type ModalTitleProps } from '../ModalTitle'
/**
 * TODO: [IN-797] Service Modal updates
 *
 * - Fix 'at capacity' layout/spacing
 * - Community focus to use badges with short name & icon
 * - Cost to use attribute badge
 * - Validate data display against finalized data structure.
 */

const CONTACTS = ['phone', 'email', 'website'] as const

const ServiceModalBody = forwardRef<HTMLButtonElement, ServiceModalProps>(({ serviceId, ...props }, ref) => {
	const slug = useSlug()
	const { data, status } = api.service.forServiceModal.useQuery(serviceId)
	const { data: orgId } = api.organization.getIdFromSlug.useQuery({ slug })
	const { t, i18n } = useTranslation(orgId?.id ? ['common', 'attribute', orgId.id] : ['common', 'attribute'])
	const [opened, handler] = useDisclosure(false)
	const theme = useMantineTheme()
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

	const ServiceModalTitle = () => {
		const icons = ['share', 'save'] satisfies ModalTitleProps['icons']
		const router = useRouter<'/org/[slug]' | '/org/[slug]/[orgLocationId]'>()
		const { orgLocationId } = router.query
		const apiQuery = typeof orgLocationId === 'string' ? { orgLocationId } : { slug }
		const { data, status } = api.service.getParentName.useQuery(apiQuery)

		if (isMobile || status === 'loading')
			return (
				<ModalTitle breadcrumb={{ option: 'back', backTo: 'none', onClick: handler.close }} icons={icons} />
			)

		if (data && status === 'success')
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

	if (data && status === 'success') {
		const { serviceName, services, hours, accessDetails, attributes, description, locations } = data

		const serviceBadges = (
			<Badge.Group>
				{services.map(({ tag }) => (
					<Badge.Service key={tag.tsKey}>{t(tag.tsKey, { ns: 'services' })}</Badge.Service>
				))}
			</Badge.Group>
		)
		const { getHelp, publicTransit } = processAccessInstructions({ accessDetails, locations, t })
		const { eligibility, clientsServed, cost, lang, misc, miscWithIcons, atCapacity } = processAttributes({
			attributes,
			t,
			locale: i18n.language,
		})

		const eligibilityItems: ReactNode[] = []

		if (eligibility.age)
			eligibilityItems.push(
				<Section.Sub key='ages' title={t('service.ages')}>
					{eligibility.age}
				</Section.Sub>
			)

		if (eligibility.requirements.length > 0)
			eligibilityItems.push(
				<Section.Sub key='req' title={t('service.requirements')}>
					<List>
						{eligibility.requirements.map((text, i) => (
							<List.Item key={`${i}-${text}`}>{text}</List.Item>
						))}
					</List>
				</Section.Sub>
			)

		if (eligibility.freeText.length > 0)
			eligibilityItems.push(
				<Section.Sub key='addtnl' title={t('service.additional-info')}>
					{eligibility.freeText}
				</Section.Sub>
			)

		const languages =
			lang.length === 0 ? undefined : (
				<Section.Sub title={t('service.languages')}>
					<List>
						{lang.map((lang, i) => (
							<List.Item key={`${i}-${lang}`}>{lang}</List.Item>
						))}
					</List>
				</Section.Sub>
			)

		const extraInfo: ReactNode[] = []

		if (miscWithIcons.length > 0)
			extraInfo.push(
				<Section.Sub key='miscbadges'>
					<Badge.Group withSeparator={false}>{miscWithIcons}</Badge.Group>
				</Section.Sub>
			)

		if (misc.length > 0)
			extraInfo.push(
				<Section.Sub key='misc' title={t('service.additional-info')}>
					<List>
						{misc.map((text, i) => (
							<List.Item key={`${i}-${text}`}>{text}</List.Item>
						))}
					</List>
				</Section.Sub>
			)

		return (
			<>
				<Modal
					title={<ServiceModalTitle />}
					opened={opened}
					onClose={() => handler.close()}
					fullScreen={isMobile}
					withinPortal
				>
					<Stack spacing={24}>
						<Stack spacing={16}>
							{atCapacity}
							{serviceName && (
								<Title order={2}>
									{t(serviceName.key, { ns: orgId?.id, defaultValue: serviceName.tsKey.text })}
								</Title>
							)}
							{description && (
								<Text>{t(description.key, { ns: orgId?.id, defaultValue: description.tsKey.text })}</Text>
							)}
						</Stack>
						{serviceBadges}
						{(hasContactInfo(getHelp) || Boolean(hours.length)) && (
							<Section.Divider title={t('service.get-help')}>
								{hasContactInfo(getHelp) && (
									<ContactInfo passedData={getHelp} direct order={['phone', 'email', 'website']} />
								)}
								{Boolean(hours.length) && <Hours parentId={serviceId} label='service' />}
							</Section.Divider>
						)}
						{(Boolean(clientsServed.srvfocus.length) || Boolean(clientsServed.targetPop.length)) && (
							<Section.Divider title={t('service.clients-served')}>
								{Boolean(clientsServed.srvfocus.length) && (
									<Section.Sub title={t('service.community-focus')}>
										<Badge.Group withSeparator={false}>{clientsServed.srvfocus}</Badge.Group>
									</Section.Sub>
								)}
								{Boolean(clientsServed.targetPop.length) && (
									<Section.Sub title={t('service.target-population')}>{clientsServed.targetPop}</Section.Sub>
								)}
							</Section.Divider>
						)}
						<Section.Divider title={t('service.cost')}>{cost}</Section.Divider>
						<Section.Divider title={t('service.eligibility')}>{eligibilityItems}</Section.Divider>
						<Section.Divider title={t('service.languages')}>{languages}</Section.Divider>
						<Section.Divider title={t('service.additional-info')}>{extraInfo}</Section.Divider>
						<Section.Divider title={t('service.transit-directions')}>{publicTransit}</Section.Divider>
					</Stack>
				</Modal>
				<Box
					component='button'
					ref={ref}
					onClick={() => {
						serviceModalEvent.opened({ serviceId, serviceName: serviceName?.tsKey?.text, orgSlug: slug })
						handler.open()
					}}
					{...props}
				/>
			</>
		)
	}

	return <Box component='button' ref={ref} style={{ cursor: 'wait' }} {...props} />
})
ServiceModalBody.displayName = 'ServiceModal'

export const ServiceModal = createPolymorphicComponent<'button', ServiceModalProps>(ServiceModalBody)
export interface ServiceModalProps extends ButtonProps {
	serviceId: string
}
