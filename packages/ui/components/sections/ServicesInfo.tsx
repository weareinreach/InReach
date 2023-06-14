import { Card, createStyles, Group, rem, Skeleton, Stack, Text } from '@mantine/core'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { transformer } from '@weareinreach/api/lib/transformer'
import { Badge, BadgeGroup } from '~ui/components/core/Badge'
import { useCustomVariant, useScreenSize } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { ServiceModal } from '~ui/modals/Service'

// const serviceCat: Record<string, Set<string>> = {}
let servObj: ServObj = {}

type ServiceSectionProps = {
	category: string | string[]
	services: ServItem[]
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

const ServiceSection = ({ category, services }: ServiceSectionProps) => {
	const router = useRouter<'/org/[slug]' | '/org/[slug]/[orgLocationId]'>()
	const { slug, orgLocationId } = router.query
	const { t } = useTranslation(['common', 'services', slug])
	const { classes } = useServiceSectionStyles()
	const apiQuery = typeof orgLocationId === 'string' ? { orgLocationId } : { slug }
	const { data: parent } = api.service.getParentName.useQuery(apiQuery)

	const variants = useCustomVariant()
	const apiUtils = api.useContext()

	const breadCrumbProps = parent?.name
		? ({ option: 'back', backTo: 'dynamicText', backToText: parent.name } as const)
		: ({ option: 'back', backTo: 'none' } as const)
	// api.service.byId.useQuery({ id: preloadService }, { enabled: preloadService !== '' })
	return (
		<Stack spacing={8}>
			{Array.isArray(category) ? (
				<BadgeGroup badges={category.map((tsKey) => ({ variant: 'service', tsKey }))} />
			) : (
				<Badge variant='service' tsKey={category} />
			)}
			<Stack spacing={0}>
				{services.map((service) => (
					<ServiceModal
						key={service.id}
						serviceId={service.id}
						component={Group}
						position='apart'
						noWrap
						className={classes.group}
						onMouseOver={() => apiUtils.service.byId.prefetch({ id: service.id })}
					>
						<Text variant={variants.Text.utility1}>
							{t(service.tsKey ?? '', { ns: slug, defaultValue: service.defaultText }) as string}
						</Text>
						<Icon icon='carbon:chevron-right' height={24} width={24} className={classes.icon} />
					</ServiceModal>
				))}
			</Stack>
		</Stack>
	)
}

type ServObj = { [k: string]: Set<string> }
type ServItem = {
	id: string
	tsNs: string
	tsKey?: string
	defaultText?: string
}

export const ServicesInfoCard = ({ parentId }: ServicesInfoCardProps) => {
	// const { t } = useTranslation()
	const { isMobile } = useScreenSize()
	const { data: services, isLoading } = api.service.forServiceInfoCard.useQuery(parentId)

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

	for (const service of services) {
		servObj = service.services.reduce((items: ServObj, record) => {
			const key = record.tag.category.tsKey
			if (!items[key]) {
				items[key] = new Set()
			}
			items[key]?.add(
				transformer.stringify({
					id: service.id,
					tsNs: service.serviceName?.ns,
					tsKey: service.serviceName?.key,
					defaultText: service.serviceName?.tsKey.text,
				})
			)
			return items
		}, servObj)
	}
	const sections = Object.entries(servObj).map(([key, value]) => {
		const valSet = [...value]
		const services = valSet.map((item) => transformer.parse<ServItem>(item))
		return <ServiceSection key={key} category={key} services={services} />
	})

	const body = <Stack spacing={40}>{sections}</Stack>

	return isMobile ? body : <Card>{body}</Card>
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>

export type ServicesInfoCardProps = {
	// services: PageQueryResult['locations'][number]['services'] | PageQueryResult['services']
	/** Can be either an OrganizationID or a LocationID */
	parentId: string
}
