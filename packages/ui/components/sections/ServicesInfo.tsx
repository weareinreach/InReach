import {
	Box,
	Card,
	Group,
	Skeleton,
	Stack,
	Text,
	Tooltip,
	UnstyledButton,
	useMantineTheme,
} from '@mantine/core'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { useCallback, useEffect, useRef, useState } from 'react'

import { transformer } from '@weareinreach/util/transformer'
import { Link } from '~ui/components/core'
import { Badge } from '~ui/components/core/Badge'
import { ServiceEditDrawer } from '~ui/components/data-portal/ServiceEditDrawer'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useEditMode } from '~ui/hooks/useEditMode'
import { useScreenSize } from '~ui/hooks/useScreenSize'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { DuplicateServiceModal } from '~ui/modals/dataPortal/DuplicateService'
import { ServiceModal } from '~ui/modals/Service'

import classes from './ServicesInfo.module.css'

type ServiceSectionProps = {
	category: string | string[]
	services: ServItem[]
	hideRemoteBadges?: boolean
}

const ServiceSection = ({ category, services, hideRemoteBadges }: ServiceSectionProps) => {
	const router = useRouter<'/org/[slug]' | '/org/[slug]/[orgLocationId]'>()
	const { isEditMode } = useEditMode()
	const { slug } = router.isReady ? router.query : { slug: '' }
	// Deep-link support (e.g. Bulk Search & Replace's "full edit" action) - `serviceId` isn't a route
	// param nextjs-routes knows about for any page this component renders on, just a plain query string
	// key, hence the cast rather than widening the `useRouter` generic above (which only models real
	// dynamic path segments, never arbitrary extra query params).
	const autoOpenServiceId = (router.query as { serviceId?: string }).serviceId
	const { data: orgId } = api.organization.getIdFromSlug.useQuery({ slug })
	// Array length must stay constant across renders - react-i18next's useTranslation passes
	// this array in as a useMemo dependency list. Substitute an already-loaded namespace
	// ('common') as a harmless placeholder until the org ID resolves, instead of omitting
	// the slot.
	const namespaces = ['common', 'services', orgId?.id ?? 'common']

	const { t } = useTranslation(namespaces)
	const theme = useMantineTheme()
	const variants = useCustomVariant()
	const apiUtils = api.useUtils()
	const [duplicatedServiceId, setDuplicatedServiceId] = useState<string | null>(null)
	const autoOpenDuplicateRef = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		if (duplicatedServiceId) {
			autoOpenDuplicateRef.current?.click()
		}
	}, [duplicatedServiceId])

	const preloadService = useCallback(
		(serviceId: string) => () => apiUtils.service.forServiceModal.prefetch(serviceId),
		[apiUtils.service.forServiceModal]
	)
	const getTextVariant = useCallback(
		(published: boolean, deleted: boolean) => {
			if (deleted) {
				return variants.Text.utility1darkGrayStrikethru
			}
			if (!published) {
				return variants.Text.utility1darkGray
			}
			return variants.Text.utility1
		},
		[variants]
	)

	const badges = Array.isArray(category) ? (
		<Badge.Group>
			{category.map((tsKey) => (
				<Badge.Service key={`(${category.join('-')}).${tsKey}`}>{t(tsKey, { ns: 'services' })}</Badge.Service>
			))}
		</Badge.Group>
	) : (
		<Badge.Service>{t(category, { ns: 'services' })}</Badge.Service>
	)

	return (
		<Stack gap={8}>
			{badges}
			<Stack gap={0}>
				{services.map((service) => {
					const serviceName = t(service.tsKey, { ns: orgId?.id, defaultValue: service.defaultText })
					const children = (
						<>
							{service.offersRemote && !hideRemoteBadges ? (
								<Group gap={8} align='center'>
									{!service.published && (
										<Icon icon='carbon:view-off' color={theme.other.colors.secondary.darkGray} height={24} />
									)}
									<Text variant={getTextVariant(service.published, service.deleted)}>{serviceName}</Text>
									<Badge.Remote />
								</Group>
							) : (
								<Group gap={8}>
									{!service.published && (
										<Icon icon='carbon:view-off' color={theme.other.colors.secondary.darkGray} height={24} />
									)}
									<Text variant={getTextVariant(service.published, service.deleted)}>{serviceName}</Text>
								</Group>
							)}
							<Icon icon='carbon:chevron-right' height={24} width={24} className={classes.icon} />
						</>
					)

					return isEditMode ? (
						<Box key={service.id} style={{ position: 'relative' }}>
							<ServiceEditDrawer
								serviceId={service.id}
								autoOpen={service.id === autoOpenServiceId}
								variant={variants.Link.inlineInverted}
								component={Link}
							>
								<Group wrap='nowrap' justify='space-between' className={classes.group}>
									{children}
								</Group>
							</ServiceEditDrawer>
							{/* Every row gets its own icon, positioned the same way regardless of the row's index -
							    offset left of the chevron (which sits flush at the row's right edge, since
							    `classes.group` has no horizontal padding) so the two icons never overlap. */}
							<Tooltip label='Duplicate this service' withArrow>
								<Box
									style={{
										display: 'inline-block',
										position: 'absolute',
										top: '50%',
										right: 32,
										transform: 'translateY(-50%)',
									}}
								>
									<DuplicateServiceModal
										sourceServiceId={service.id}
										onSuccess={setDuplicatedServiceId}
										component={UnstyledButton}
									>
										<Icon icon='carbon:copy' height={20} color='black' />
									</DuplicateServiceModal>
								</Box>
							</Tooltip>
						</Box>
					) : (
						<ServiceModal
							key={service.id}
							serviceId={service.id}
							itemName={serviceName}
							organizationId={orgId?.id}
							component={Group}
							justify='space-between'
							wrap='nowrap'
							className={classes.group}
							onMouseOver={preloadService(service.id)}
						>
							{children}
						</ServiceModal>
					)
				})}
			</Stack>
			{duplicatedServiceId && (
				<ServiceEditDrawer
					serviceId={duplicatedServiceId}
					ref={autoOpenDuplicateRef}
					style={{ display: 'none' }}
				/>
			)}
		</Stack>
	)
}

type ServItem = {
	id: string
	tsNs: string
	tsKey: string
	defaultText: string
	offersRemote: boolean
	published: boolean
	deleted: boolean
}

export const ServicesInfoCard = ({ parentId, hideRemoteBadges, remoteOnly }: ServicesInfoCardProps) => {
	const { isMobile } = useScreenSize()
	const { isEditMode } = useEditMode()
	const { data: services, isLoading } = api.service.forServiceInfoCard.useQuery({
		parentId,
		remoteOnly,
		isEditMode,
	})

	if (isLoading || !services) {
		return isMobile ? (
			<Skeleton visible={true} />
		) : (
			<Card>
				<Skeleton visible={true} />
			</Card>
		)
	}
	// service can have many tags - narrow down
	const serviceMap = new Map<string, Set<string>>()

	for (const service of services) {
		const key = service.serviceCategories.join(',')

		if (serviceMap.has(key)) {
			const serviceSet = serviceMap.get(key)
			if (!serviceSet) {
				continue
			}
			serviceSet.add(
				transformer.stringify({
					id: service.id,
					tsNs: service.serviceName?.tsNs,
					tsKey: service.serviceName?.tsKey,
					defaultText: service.serviceName?.defaultText,
					offersRemote: service.offersRemote,
					published: service.published,
					deleted: service.deleted,
				})
			)
			serviceMap.set(key, serviceSet)
		} else {
			serviceMap.set(
				key,
				new Set([
					transformer.stringify({
						id: service.id,
						tsNs: service.serviceName?.tsNs,
						tsKey: service.serviceName?.tsKey,
						defaultText: service.serviceName?.defaultText,
						offersRemote: service.offersRemote,
						published: service.published,
						deleted: service.deleted,
					}),
				])
			)
		}
	}

	const sectionArray: [string[], Set<string>][] = Array.from(serviceMap.entries())
		.map<[string[], Set<string>]>(([key, value]) => [key.split(','), value])
		.sort((a, b) => (Array.isArray(a[0]) && Array.isArray(b[0]) ? b[0].length - a[0].length : -1))

	const sections = sectionArray.map(([key, value]) => {
		const valSet = [...value]
		const serviceList = valSet.map((item) => transformer.parse<ServItem>(item))
		return (
			<ServiceSection
				key={key.join('-')}
				category={key}
				services={serviceList}
				{...(hideRemoteBadges ? { hideRemoteBadges } : {})}
			/>
		)
	})

	const body = <Stack gap={40}>{sections}</Stack>

	return isMobile ? body : <Card>{body}</Card>
}

export type ServicesInfoCardProps = {
	/** Can be either an OrganizationID or a LocationID */
	parentId: string
	hideRemoteBadges?: boolean
	remoteOnly?: boolean
}
