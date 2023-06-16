import { Card, Divider, Group, List, Stack, Title, useMantineTheme } from '@mantine/core'
import { useElementSize } from '@mantine/hooks'
import parsePhoneNumber, { type CountryCode } from 'libphonenumber-js'
import { formatAddress } from 'localized-address-format'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useEffect } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { BadgeGroup } from '~ui/components/core/Badge'
import { Link } from '~ui/components/core/Link'
import { Rating } from '~ui/components/core/Rating'
import { useCustomVariant } from '~ui/hooks'
import { type IconList } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

export const LocationCard = ({ remoteOnly, locationId }: LocationCardProps) => {
	const router = useRouter<'/org/[slug]'>()
	const variants = useCustomVariant()
	const { t } = useTranslation(['gov-dist', 'common'])
	const { ref: addressRef, height: addressListHeight } = useElementSize()
	const theme = useMantineTheme()
	const { data, isLoading } = api.location.forLocationCard.useQuery(locationId)

	if (!data) return null

	const adminArea = data.govDist?.abbrev
		? data.govDist.abbrev
		: data.govDist?.tsKey
		? (t(data.govDist.tsKey, { ns: data.govDist.tsNs }) satisfies string)
		: undefined

	const formattedAddress = formatAddress({
		addressLines: data.street2 ? [data.street1.trim(), data.street2.trim()] : [data.street1.trim()],
		locality: data.city.trim(),
		postalCode: data.postCode ? data.postCode.trim() : undefined,
		postalCountry: data.country,
		administrativeArea: adminArea,
	}).join(', ')

	const primaryPhone = data.phones.find((phone) => Boolean(phone.primary)) ?? data.phones[0]

	const parsedPhone = primaryPhone
		? parsePhoneNumber(primaryPhone.number, primaryPhone.country as CountryCode)
		: undefined
	const formattedPhone = parsedPhone ? parsedPhone.formatNational() : undefined

	const isAddressSingleLine = addressListHeight > 36
	const addressListVariant = isAddressSingleLine
		? variants.List.inlineUtil2DarkGray
		: variants.List.inlineBulletUtil2DarkGray
	const separator = (
		<Divider w={4} size={4} style={{ borderRadius: '50%' }} color={theme.other.colors.secondary.darkGray} />
	)
	const listProps = { variant: addressListVariant, icon: separator, ref: addressRef }

	const hasServices = Boolean(data.services.length)
	const hasAttributes = Boolean(data.attributes.length)

	// useEffect(
	// 	() => {
	// 		router.prefetch(`/org/${router.query.slug as string}/${location.id}`)
	// 	},
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// 	[location.id]
	// )

	return (
		<Link
			href={{
				pathname: '/org/[slug]/[orgLocationId]',
				query: {
					slug: router.query.slug,
					orgLocationId: data.id,
				},
			}}
			variant={variants.Link.card}
		>
			<Card
				w='100%'
				variant={variants.Card.hoverCoolGray}
				// onClick={() =>
				// 	router.push({
				// 		pathname: '/org/[slug]/[orgLocationId]',
				// 		query: {
				// 			slug: router.query.slug as string,
				// 			orgLocationId: location.id,
				// 		},
				// 	})
				// }
			>
				<Stack spacing={32}>
					<Stack spacing={12}>
						<Title order={2}>{data.name}</Title>
						<List {...listProps}>
							<List.Item>{formattedAddress}</List.Item>
							{formattedPhone && <List.Item>{formattedPhone}</List.Item>}
						</List>
					</Stack>
					{hasServices && (
						<Stack spacing={12}>
							<Title order={3}>{t('services', { ns: 'common' })}</Title>
							<BadgeGroup
								badges={data.services.map((tsKey) => ({
									variant: 'service',
									tsKey,
								}))}
							/>
						</Stack>
					)}
					<Group spacing={24}>
						{hasAttributes && (
							<BadgeGroup
								badges={data.attributes.map((attribute) => ({
									variant: 'attribute',
									tsNs: attribute.tsNs,
									tsKey: attribute.tsKey,
									icon: attribute.icon as IconList,
								}))}
							/>
						)}
						<Rating hideCount recordId={data.id} />
					</Group>
				</Stack>
			</Card>
		</Link>
	)
}

export type LocationCardProps = {
	locationId: string
	remoteOnly?: boolean
}
