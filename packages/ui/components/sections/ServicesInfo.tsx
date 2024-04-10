import { Card, createStyles, Group, rem, Skeleton, Stack, Text } from '@mantine/core'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useCallback } from 'react'

import { transformer } from '@weareinreach/util/transformer'
import { Link } from '~ui/components/core'
import { Badge } from '~ui/components/core/Badge'
import { ServiceEditDrawer } from '~ui/components/data-portal/ServiceEditDrawer'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useEditMode } from '~ui/hooks/useEditMode'
import { useScreenSize } from '~ui/hooks/useScreenSize'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { ServiceModal } from '~ui/modals/Service'

type ServiceSectionProps = {
	category: string | string[]
	services: ServItem[]
	hideRemoteBadges?: boolean
}

const useServiceSectionStyles = createStyles((theme) => ({
	group: {
		borderBottom: `${rem(1)} solid ${theme.other.colors.tertiary.coolGray}`,
		// paddingBottom: rem(12),
		padding: `${rem(12)} ${rem(0)}`,
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
			cursor: 'pointer',
		},
	},
	icon: {
		minHeight: rem(24),
		minWidth: rem(24),
	},
}))

const ServiceSection = ({ category, services, hideRemoteBadges }: ServiceSectionProps) => {
	const router = useRouter<'/org/[slug]' | '/org/[slug]/[orgLocationId]'>()
	const { isEditMode } = useEditMode()
	const { slug } = router.isReady ? router.query : { slug: '' }
	const { data: orgId } = api.organization.getIdFromSlug.useQuery({ slug }, { enabled: router.isReady })
	const { t } = useTranslation(orgId?.id ? ['common', 'services', orgId.id] : ['common', 'services'])
	const { classes } = useServiceSectionStyles()

	const variants = useCustomVariant()
	const apiUtils = api.useUtils()

	const preloadService = useCallback(
		(serviceId: string) => () => apiUtils.service.forServiceModal.prefetch(serviceId),
		[apiUtils.service.forServiceModal]
	)

	return (
		<Stack spacing={8}>
			{Array.isArray(category) ? (
				<Badge.Group>
					{category.map((tsKey) => (
						<Badge.Service key={tsKey}>{t(tsKey, { ns: 'services' })}</Badge.Service>
					))}
				</Badge.Group>
			) : (
				<Badge.Service>{t(category, { ns: 'services' })}</Badge.Service>
			)}
			<Stack spacing={0}>
				{services.map((service) => {
					const serviceName = t(service.tsKey, { ns: orgId?.id, defaultValue: service.defaultText })
					const children = (
						<>
							{service.offersRemote && !hideRemoteBadges ? (
								<Group spacing={8} align='center'>
									<Text variant={variants.Text.utility1}>{serviceName}</Text>
									<Badge.Remote />
								</Group>
							) : (
								<Text variant={variants.Text.utility1}>{serviceName}</Text>
							)}
							<Icon icon='carbon:chevron-right' height={24} width={24} className={classes.icon} />
						</>
					)

					return isEditMode ? (
						<ServiceEditDrawer
							key={service.id}
							serviceId={service.id}
							variant={variants.Link.inlineInverted}
							component={Link}
						>
							<Group noWrap position='apart' className={classes.group}>
								{children}
							</Group>
						</ServiceEditDrawer>
					) : (
						<ServiceModal
							key={service.id}
							serviceId={service.id}
							component={Group}
							position='apart'
							noWrap
							className={classes.group}
							onMouseOver={preloadService(service.id)}
						>
							{children}
						</ServiceModal>
					)
				})}
			</Stack>
		</Stack>
	)
}

type ServItem = {
	id: string
	tsNs: string
	tsKey: string
	defaultText: string
	offersRemote: boolean
}

export const ServicesInfoCard = ({ parentId, hideRemoteBadges, remoteOnly }: ServicesInfoCardProps) => {
	const { isMobile } = useScreenSize()
	const { data: services, isLoading } = api.service.forServiceInfoCard.useQuery({ parentId, remoteOnly })

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

	const body = <Stack spacing={40}>{sections}</Stack>

	return isMobile ? body : <Card>{body}</Card>
}

export type ServicesInfoCardProps = {
	/** Can be either an OrganizationID or a LocationID */
	parentId: string
	hideRemoteBadges?: boolean
	remoteOnly?: boolean
}
