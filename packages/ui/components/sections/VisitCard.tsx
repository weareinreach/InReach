import { Title, Grid, Card, List, Stack, Group } from '@mantine/core'
import { type ApiOutput } from '@weareinreach/api'
import { formatAddress } from 'localized-address-format'
import { useTranslation } from 'next-i18next'

import { useCustomVariant, useScreenSize } from '~ui/hooks'
import { type IconList } from '~ui/icon'

export const VisitCard = (props: VisitCardProps) => {
	const variants = useCustomVariant()
	const { isMobile } = useScreenSize()

	return <></>
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>

export type VisitCardProps = {
	location: PageQueryResult['locations'][number]
}
