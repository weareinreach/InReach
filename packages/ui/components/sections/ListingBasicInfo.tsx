import { Stack, Title, Text } from '@mantine/core'
import { type ApiOutput } from '@weareinreach/api'
import { useTranslation } from 'next-i18next'

import { Rating, BadgeGroup, type CustomBadgeProps } from '~ui/components/core'
import { useFormattedAddress, useCustomVariant } from '~ui/hooks'

export const ListingBasicInfo = ({ role, data }: ListingBasicInfoProps) => {
	const { t } = useTranslation([data.slug])
	const variants = useCustomVariant()
	const { attributes, isClaimed, locations, description, slug } = data

	const isMultiLoc = role === 'org' && (locations?.length ?? 0) > 1
	const isSingleLoc = locations?.length === 1
	const location = isSingleLoc ? locations[0] : undefined

	const addressLine = <Text variant={variants.Text.utility2darkGray}>{useFormattedAddress(location)}</Text>

	const leaderAttributes = attributes.filter(({ attribute }) =>
		attribute.categories.some(({ category }) => category.tag === 'organization-leadership')
	)
	const focusedCommunities = attributes.filter(({ attribute }) =>
		attribute.categories.some(
			({ category }) => category.tag === 'service-focus' && attribute._count.parents === 0
		)
	)

	const infoBadges = () => {
		const output: CustomBadgeProps[] = []
		if (leaderAttributes.length) {
			leaderAttributes.forEach((entry) =>
				output.push({
					variant: 'leader',
					icon: entry.attribute.icon ?? '',
					iconBg: entry.attribute.iconBg ?? '#FFF',
					tsKey: entry.attribute.tsKey,
				})
			)
		}
		if (data.lastVerified)
			output.push({
				variant: 'verified',
				lastverified: data.lastVerified.toString(),
			})
		output.push({
			variant: isClaimed ? 'claimed' : 'unclaimed',
		})

		return output
	}
	const focusedCommBadges: CustomBadgeProps[] = focusedCommunities.map(({ attribute }) => ({
		variant: 'community',
		tsKey: attribute.tsKey,
		icon: attribute.icon ?? '',
	}))

	const descriptionSection =
		description && description.key ? (
			<Text>{t(description.key, { ns: slug, defaultValue: description.tsKey.text })}</Text>
		) : null

	return (
		<Stack align='flex-start' spacing={12}>
			<Title order={2}>{data.name}</Title>
			{isSingleLoc && <Rating recordId={data.id} noMargin />}
			{addressLine}
			<BadgeGroup badges={infoBadges()} withSeparator />
			{descriptionSection}
			<BadgeGroup badges={focusedCommBadges} />
		</Stack>
	)
}

export type ListingBasicInfoProps = { role: 'org' | 'location' } & (OrgInfoProps | LocationInfoProps)

export interface OrgInfoProps {
	role: 'org'
	data: {
		name: string
		id: string
		slug: string
		lastVerified: NonNullable<ApiOutput['organization']['getBySlug']>['lastVerified']
		attributes: NonNullable<ApiOutput['organization']['getBySlug']>['attributes']
		description: NonNullable<ApiOutput['organization']['getBySlug']>['description']
		locations: NonNullable<ApiOutput['organization']['getBySlug']>['locations']
		isClaimed: boolean
	}
}

export interface LocationInfoProps {
	role: 'location'
	data: {
		name: string
		id: string
		slug: string
		lastVerified: NonNullable<ApiOutput['organization']['getBySlug']>['lastVerified']
		attributes: NonNullable<ApiOutput['location']['getById']>['attributes']
		description: NonNullable<ApiOutput['location']['getById']>['description']
		locations: NonNullable<ApiOutput['location']['getById']>[]
		isClaimed: boolean
	}
}
