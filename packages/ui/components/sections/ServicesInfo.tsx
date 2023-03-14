import { Stack, Text, Card, Group, createStyles, rem } from '@mantine/core'
import { modals } from '@mantine/modals'
import { type ApiOutput } from '@weareinreach/api'
import { transformer } from '@weareinreach/api/lib/transformer'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { Badge } from '~ui/components/core'
import { useCustomVariant, useScreenSize } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { ServiceModal } from '~ui/modals/Service'

const serviceCat: Record<string, Set<string>> = {}
let servObj: ServObj = {}

type ServiceSectionProps = {
	category: string
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
	const [preloadService, setPreloadService] = useState<string>('')
	const variants = useCustomVariant()

	const breadCrumbProps = parent?.name
		? ({ option: 'back', backTo: 'dynamicText', backToText: parent.name } as const)
		: ({ option: 'back', backTo: 'none' } as const)
	const modalOpen = (serviceId: string) =>
		modals.open(
			ServiceModal({
				title: { breadcrumb: breadCrumbProps, icons: ['share', 'save'] },
				body: { serviceId },
			})
		)
	api.service.byId.useQuery({ id: preloadService }, { enabled: preloadService !== '' })
	return (
		<Stack spacing={0}>
			<Badge variant='service' tsKey={category} />
			{services.map((service) => (
				<Group
					key={service.id}
					position='apart'
					noWrap
					className={classes.group}
					onClick={() => modalOpen(service.id)}
					onMouseOver={() => setPreloadService(service.id)}
				>
					<Text variant={variants.Text.utility1}>
						{t(service.tsKey ?? '', { ns: slug, defaultValue: service.defaultText }) as string}
					</Text>
					<Icon icon='carbon:chevron-right' height={24} width={24} className={classes.icon} />
				</Group>
			))}
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

export const ServicesInfoCard = (props: ServicesInfoCardProps) => {
	const { t } = useTranslation()
	const { isMobile } = useScreenSize()
	const { services } = props

	// service can have many tags - narrow down

	for (const { service } of services) {
		servObj = service.services.reduce((items: ServObj, record) => {
			const key = record.tag.category.tsKey
			if (!items[key]) {
				items[key] = new Set()
			}
			items[key]!.add(
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
	services: PageQueryResult['locations'][number]['services'] | PageQueryResult['services']
}
