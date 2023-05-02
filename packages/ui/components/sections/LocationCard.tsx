import { Title, Card, List, Stack, Group, Divider, useMantineTheme } from '@mantine/core'
import { useElementSize } from '@mantine/hooks'
import parsePhoneNumber, { type CountryCode } from 'libphonenumber-js'
import { formatAddress } from 'localized-address-format'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type ApiOutput } from '@weareinreach/api'

import { Rating, BadgeGroup } from '~ui/components/core'
import { useCustomVariant } from '~ui/hooks'
import { type IconList } from '~ui/icon'

export const LocationCard = (props: LocationCardProps) => {
	const router = useRouter()
	const variants = useCustomVariant()
	const { t } = useTranslation(['gov-dist', 'common'])
	const { location } = props
	const { ref: addressRef, height: addressListHeight } = useElementSize()
	const theme = useMantineTheme()

	const adminArea = location.govDist?.abbrev
		? location.govDist.abbrev
		: location.govDist?.tsKey
		? (t(location.govDist.tsKey, { ns: location.govDist.tsNs }) as string)
		: undefined

	const formattedAddress = formatAddress({
		addressLines: location.street2
			? [location.street1.trim(), location.street2.trim()]
			: [location.street1.trim()],
		locality: location.city.trim(),
		postalCode: location.postCode ? location.postCode.trim() : undefined,
		postalCountry: location.country.cca2,
		administrativeArea: adminArea,
	}).join(', ')

	const primaryPhone = location.phones.find((phone) => Boolean(phone.phone.primary)) ?? location.phones[0]

	const parsedPhone = primaryPhone
		? parsePhoneNumber(primaryPhone.phone.number, primaryPhone.phone.country.cca2 as CountryCode)
		: undefined
	const formattedPhone = parsedPhone ? parsedPhone.formatNational() : undefined

	const serviceTags = new Set(
		location.services.flatMap(({ service }) => service.services.map((service) => service.tag.category.tsKey))
	)
	const isAddressSingleLine = addressListHeight > 36
	const addressListVariant = isAddressSingleLine ? variants.List.inlineUtil2 : variants.List.inlineBulletUtil2
	const separator = (
		<Divider w={4} size={4} style={{ borderRadius: '50%' }} color={theme.other.colors.secondary.darkGray} />
	)
	const listProps = { variant: addressListVariant, icon: separator, ref: addressRef }

	const attributeTags = location.attributes.filter(({ attribute }) => Boolean(attribute.showOnLocation))

	const hasServices = Boolean(serviceTags.size)
	const hasAttributes = Boolean(attributeTags.length)

	return (
		<Card
			w='100%'
			variant={variants.Card.hoverCoolGray}
			onClick={() =>
				router.push({
					pathname: '/org/[slug]/[orgLocationId]',
					query: {
						slug: router.query.slug as string,
						orgLocationId: location.id,
					},
				})
			}
		>
			<Stack spacing={32}>
				<Stack spacing={12}>
					<Title order={2}>{location.name}</Title>
					<List {...listProps}>
						<List.Item>{formattedAddress}</List.Item>
						{formattedPhone && <List.Item>{formattedPhone}</List.Item>}
					</List>
				</Stack>
				{hasServices && (
					<Stack spacing={12}>
						<Title order={3}>{t('services', { ns: 'common' })}</Title>
						<BadgeGroup
							badges={[...serviceTags].map((tsKey) => ({
								variant: 'service',
								tsKey,
							}))}
						/>
					</Stack>
				)}
				<Group spacing={24}>
					{hasAttributes && (
						<BadgeGroup
							badges={attributeTags.map(({ attribute }) => ({
								variant: 'attribute',
								tsNs: attribute.tsNs,
								tsKey: attribute.tsKey,
								icon: attribute.icon as IconList,
							}))}
						/>
					)}
					<Rating hideCount recordId={location.id} />
				</Group>
			</Stack>
		</Card>
	)
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>

export type LocationCardProps = {
	location: PageQueryResult['locations'][number]
}
