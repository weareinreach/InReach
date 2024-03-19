import { Divider, Group, Skeleton, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { memo } from 'react'
import { useFormContext } from 'react-hook-form'
import { Textarea, TextInput } from 'react-hook-form-mantine'

import { type ApiOutput } from '@weareinreach/api'
import { BadgeGroup, type CustomBadgeProps } from '~ui/components/core/Badge'
import { Rating } from '~ui/components/core/Rating'
import { InlineTextInput } from '~ui/components/data-portal/InlineTextInput'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useFormattedAddress } from '~ui/hooks/useFormattedAddress'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { BadgeEdit } from '~ui/modals/BadgeEdit'

export const ListingBasicDisplay = memo(({ data }: ListingBasicInfoProps) => {
	const { id: orgId } = useOrgInfo()
	const { t, ready: i18nReady } = useTranslation(orgId)
	const variants = useCustomVariant()
	const { attributes, isClaimed, locations, description, id } = data

	const isSingleLoc = locations?.length === 1
	const location = isSingleLoc ? locations[0] : undefined

	const formattedAddress = useFormattedAddress(location)

	const addressLine = location?.notVisitable ? null : (
		<Text variant={variants.Text.utility2darkGray}>{formattedAddress}</Text>
	)

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
			<Skeleton visible={!i18nReady}>
				<Text py={12}>{t(description.key, { ns: id, defaultValue: description.tsKey.text })}</Text>
			</Skeleton>
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
})
ListingBasicDisplay.displayName = 'ListingBasicDisplay'

export const ListingBasicEdit = ({ data, location }: ListingBasicInfoProps) => {
	const form = useFormContext()
	const { attributes, isClaimed } = data
	const theme = useMantineTheme()
	const leaderAttributes = attributes.filter(({ attribute }) =>
		attribute.categories.some(({ category }) => category.tag === 'organization-leadership')
	)
	const focusedCommunities = attributes.filter(({ attribute }) =>
		attribute.categories.some(
			({ category }) => category.tag === 'service-focus' && attribute._count.parents === 0
		)
	)

	const leaderBadges = (): CustomBadgeProps[] => {
		if (leaderAttributes.length) {
			return leaderAttributes.map(({ attribute }) => ({
				variant: 'leader',
				icon: attribute.icon ?? '',
				iconBg: attribute.iconBg ?? '#FFF',
				tsKey: attribute.tsKey,
			}))
		} else {
			return [
				{
					variant: 'leader',
					icon: '➕',
					iconBg: '#FFF',
					tsKey: 'Add leader badge',
				},
			]
		}
	}

	const infoBadges = () => {
		const output: CustomBadgeProps[] = []
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
	const focusedCommBadges: CustomBadgeProps[] = focusedCommunities.length
		? focusedCommunities.map(({ attribute }) => ({
				variant: 'community',
				tsKey: attribute.tsKey,
				icon: attribute.icon ?? '',
			}))
		: [
				{
					variant: 'community',
					icon: '➕',
					tsKey: 'Add Focused Community badge(s)',
				},
			]

	return (
		<form autoComplete='off' style={{ width: '100%' }}>
			<Stack align='flex-start' spacing={12}>
				<InlineTextInput
					component={TextInput}
					name='name'
					control={form.control}
					fontSize='h2'
					data-isDirty={form.formState.dirtyFields['name']}
				/>
				<Group noWrap spacing={8}>
					{!location && (
						<>
							<BadgeEdit orgId={data.id} badgeType='organization-leadership' component='a'>
								<BadgeGroup badges={leaderBadges()} withSeparator />
							</BadgeEdit>
							<Divider
								w={4}
								size={4}
								style={{ borderRadius: '50%' }}
								color={theme.other.colors.secondary.black}
							/>
						</>
					)}
					<BadgeGroup badges={infoBadges()} withSeparator />
				</Group>
				{!location && (
					<>
						<InlineTextInput
							component={Textarea}
							name='description'
							control={form.control}
							autosize
							data-isDirty={form.formState.dirtyFields['description']}
						/>
						<BadgeEdit orgId={data.id} badgeType='service-focus' component='a'>
							<BadgeGroup badges={focusedCommBadges} />
						</BadgeEdit>
					</>
				)}
			</Stack>
		</form>
	)
}
ListingBasicEdit.displayName = 'ListingBasicEdit'

export const ListingBasicInfo = ({ edit, ...props }: ListingBasicInfoProps) =>
	edit ? <ListingBasicEdit {...props} /> : <ListingBasicDisplay {...props} />
export type ListingBasicInfoProps = { edit?: boolean; location?: boolean } & OrgInfoProps

export interface OrgInfoProps {
	data: {
		name: string
		id: string
		slug: string
		lastVerified:
			| NonNullable<ApiOutput['organization']['forOrgPage']>['lastVerified']
			| NonNullable<ApiOutput['organization']['forLocationPage']>['lastVerified']
		attributes:
			| NonNullable<ApiOutput['organization']['forOrgPage']>['attributes']
			| NonNullable<ApiOutput['location']['forLocationPage']>['attributes']
		description:
			| NonNullable<ApiOutput['organization']['forOrgPage']>['description']
			| NonNullable<ApiOutput['location']['forLocationPage']>['description']
		locations:
			| NonNullable<ApiOutput['organization']['forOrgPage']>['locations']
			| NonNullable<ApiOutput['location']['forLocationPage']>[]
		isClaimed: boolean
	}
}
