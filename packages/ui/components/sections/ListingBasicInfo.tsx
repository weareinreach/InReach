import { Divider, Group, Skeleton, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import orderBy from 'just-order-by'
import { useTranslation } from 'next-i18next'
import { memo, type ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { Textarea, TextInput } from 'react-hook-form-mantine'

import { type ApiOutput } from '@weareinreach/api'
import { Badge } from '~ui/components/core/Badge'
import { Rating } from '~ui/components/core/Rating'
import { InlineTextInput } from '~ui/components/data-portal/InlineTextInput'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useFormattedAddress } from '~ui/hooks/useFormattedAddress'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { BadgeEdit } from '~ui/modals/BadgeEdit'

export const ListingBasicDisplay = memo(({ data }: ListingBasicInfoProps) => {
	const { id: orgId } = useOrgInfo()
	const { t, ready: i18nReady } = useTranslation(
		orgId ? ['services', 'attribute', orgId] : ['services', 'attribute']
	)
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
		const output: ReactNode[] = []
		if (leaderAttributes.length) {
			leaderAttributes.forEach((entry) =>
				output.push(
					<Badge.Leader
						key={entry.id}
						icon={entry.attribute.icon ?? ''}
						iconBg={entry.attribute.iconBg ?? '#FFF'}
					>
						{t(entry.attribute.tsKey, { ns: entry.attribute.tsNs })}
					</Badge.Leader>
				)
			)
		}
		if (data.lastVerified) {
			output.push(
				<Badge.Verified key={data.lastVerified.toString()} lastverified={data.lastVerified.toString()} />
			)
		}
		output.push(<Badge.Claimed isClaimed={isClaimed} key='claimed-org' />)

		return output
	}
	const focusedCommBadges: ReactNode[] = focusedCommunities.map(({ attribute }) => (
		<Badge.Community key={attribute.id} icon={attribute.icon ?? ''}>
			{t(attribute.tsKey, { ns: attribute.tsNs })}
		</Badge.Community>
	))

	const descriptionSection =
		description !== null ? (
			<Skeleton visible={!i18nReady}>
				<Text py={12}>{t(description.key, { ns: id, defaultValue: description.tsKey.text })}</Text>
			</Skeleton>
		) : null

	return (
		<Stack align='flex-start' spacing={12}>
			<Title order={2}>{data.name}</Title>
			{isSingleLoc && <Rating recordId={data.id} noMargin />}
			{addressLine}
			<Badge.Group withSeparator>{infoBadges()}</Badge.Group>
			{descriptionSection}
			<Badge.Group>{focusedCommBadges}</Badge.Group>
		</Stack>
	)
})
ListingBasicDisplay.displayName = 'ListingBasicDisplay'

export const ListingBasicEdit = ({ data, location }: ListingBasicInfoProps) => {
	const { id: orgId } = useOrgInfo()
	const { t } = useTranslation(orgId)
	const form = useFormContext()
	const { attributes, isClaimed } = data
	const theme = useMantineTheme()
	const leaderAttributes = orderBy(
		attributes.filter(({ attribute }) =>
			attribute.categories.some(({ category }) => category.tag === 'organization-leadership')
		),
		[
			{
				property(record) {
					return record.attribute.tsKey
				},
				order: 'asc',
			},
		]
	)
	const focusedCommunities = orderBy(
		attributes.filter(({ attribute }) =>
			attribute.categories.some(({ category }) => category.tag === 'service-focus')
		),
		[
			{
				property(record) {
					return record.attribute.tsKey
				},
				order: 'asc',
			},
		]
	)

	const leaderBadges = (): ReactNode[] => {
		if (leaderAttributes.length) {
			return leaderAttributes.map(({ attribute, id }) => (
				<Badge.Leader key={id} icon={attribute.icon ?? ''} iconBg={attribute.iconBg ?? '#FFF'}>
					{t(attribute.tsKey, { ns: attribute.tsNs })}
				</Badge.Leader>
			))
		} else {
			return [
				<Badge.Leader icon='➕' iconBg='#FFF' key='add-new-leader-badge'>
					Add leader badge
				</Badge.Leader>,
			]
		}
	}

	const infoBadges = () => {
		const output: ReactNode[] = []
		if (data.lastVerified) {
			output.push(
				<Badge.Verified key={data.lastVerified.toString()} lastverified={data.lastVerified.toString()} />
			)
		}
		output.push(<Badge.Claimed isClaimed={isClaimed} key='claimed-org' />)
		return output
	}
	const focusedCommBadges: ReactNode[] = focusedCommunities.length
		? focusedCommunities.map(({ attribute }) => (
				<Badge.Community key={attribute.id} icon={attribute.icon ?? ''}>
					{t(attribute.tsKey, { ns: attribute.tsNs })}
				</Badge.Community>
			))
		: [
				<Badge.Community icon='➕' key='add-new-community-badge'>
					Add Focused Community badge(s)
				</Badge.Community>,
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
								<Badge.Group withSeparator>{leaderBadges()}</Badge.Group>
							</BadgeEdit>
							<Divider
								w={4}
								size={4}
								style={{ borderRadius: '50%' }}
								color={theme.other.colors.secondary.black}
							/>
						</>
					)}
					<Badge.Group withSeparator>{infoBadges()}</Badge.Group>
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
							<Badge.Group>{focusedCommBadges}</Badge.Group>
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
export interface ListingBasicInfoProps extends OrgInfoProps {
	edit?: boolean
	location?: boolean
}

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
