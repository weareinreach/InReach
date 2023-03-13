import { Stack, Title, Text, Grid, Card } from '@mantine/core'
import { type ApiOutput } from '@weareinreach/api'
import { transformer } from '@weareinreach/api/lib/transformer'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { Badge } from '~ui/components/core'
import { useCustomVariant, useScreenSize } from '~ui/hooks'

const serviceCat: Record<string, Set<string>> = {}
let servObj: ServObj = {}

type ServiceSectionProps = {
	category: string
	services: ServItem[]
}

const ServiceSection = ({ category, services }: ServiceSectionProps) => {
	const router = useRouter<'/org/[slug]' | '/org/[slug]/[orgLocationId]'>()
	const { slug } = router.query
	const { t } = useTranslation(['common', 'service', slug])
	console.log(services)
	return (
		<Stack>
			<Badge variant='service' tsKey={category} />
			{services.map((service) => (
				<Text key={`${service.tsNs}.${service.tsKey}`}>
					{t(service.tsKey ?? '', { ns: service.tsNs, defaultValue: service.defaultText }) as string}
				</Text>
			))}
		</Stack>
	)
}

type ServObj = { [k: string]: Set<string> }
type ServItem = {
	// id: string
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
					tsNs: record.tag.tsNs,
					tsKey: record.tag.tsKey,
					defaultText: record.tag.name,
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

	const body = <>{sections}</>

	return <Grid.Col>{isMobile ? body : <Card>{body}</Card>}</Grid.Col>
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>

export type ServicesInfoCardProps = {
	services: PageQueryResult['locations'][number]['services'] | PageQueryResult['services']
}
