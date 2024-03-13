import { createStyles, Divider, Group, Skeleton, Space, Stack, Text, Title } from '@mantine/core'
import { useHover } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'

import { type ApiOutput } from '@weareinreach/api'
import { useCustomVariant } from '~ui/hooks'

import { ActionButtons } from './ActionButtons'
import { Badge } from './Badge'
import { Link } from './Link'

const useStyles = createStyles((theme) => ({
	cardBody: {
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},
	hoverText: {
		'&[data-hovered]': {
			textDecoration: 'underline',
		},
	},
	description: {
		[theme.fn.smallerThan('xs')]: {
			display: 'none',
		},
	},
}))

export const SearchResultLoading = () => {
	const variants = useCustomVariant()
	return (
		<>
			<Stack spacing={16}>
				<Stack spacing={12}>
					<Group position='apart'>
						<Skeleton variant={variants.Skeleton.h2} w='80%' />
						<ActionButtons.Loading />
					</Group>
					<Skeleton variant={variants.Skeleton.utility} w='25%' />
					<Stack>
						<Skeleton variant={variants.Skeleton.text} w='100%' />
						<Skeleton variant={variants.Skeleton.text} w='100%' />
						<Skeleton variant={variants.Skeleton.text} w='100%' />
						<Skeleton variant={variants.Skeleton.text} w='60%' />
					</Stack>
				</Stack>
				<Group spacing={16}>
					<Skeleton h={32} w={75} />
					<Skeleton h={32} w={75} />
					<Skeleton h={32} w={75} />
				</Group>
			</Stack>
			<Divider my={40} />
		</>
	)
}

const SearchResultData = ({ result }: SearchResultHasData) => {
	const { description, slug, name, locations, orgLeader, orgFocus, serviceCategories, national } = result
	const { t, ready: i18nReady } = useTranslation(['common', result.id])
	const variants = useCustomVariant()
	const { classes } = useStyles()
	const { hovered, ref: hoverRef } = useHover()

	if (!i18nReady) return <SearchResultLoading />

	const leaderBadgeGroup =
		orgLeader.length || national.length ? (
			<Badge.Group>
				{orgLeader.map(({ icon, iconBg, id, tsKey }) => (
					<Badge.Leader key={id} minify hideBg {...{ icon: icon ?? '', iconBg: iconBg ?? '#FFFFFF' }}>
						{t(tsKey, { ns: 'attribute' })}
					</Badge.Leader>
				))}
				{national.length ? <Badge.National countries={national} /> : null}
			</Badge.Group>
		) : null
	const communityFocusBadgeGroup = orgFocus.length ? (
		<Badge.Group>
			{orgFocus.map(({ icon, id, tsKey }) => (
				<Badge.Community key={id} icon={icon ?? ''}>
					{t(tsKey, { ns: 'attribute' })}
				</Badge.Community>
			))}
		</Badge.Group>
	) : null
	const serviceBadgeGroup = serviceCategories.length ? (
		<Badge.Group>
			{serviceCategories.map(({ id, tsKey }) => (
				<Badge.Service key={id}>{t(tsKey, { ns: 'services' })}</Badge.Service>
			))}
		</Badge.Group>
	) : null

	const cityList = (cities: string[]) => {
		//check for duplicates and be case insensitive, before switching
		const dedupedCityList: string[] = []
		const lowercaseSet: { [key: string]: boolean } = {}

		cities.forEach((value) => {
			const lowercaseValue = value.toLowerCase()
			if (!lowercaseSet[lowercaseValue]) {
				lowercaseSet[lowercaseValue] = true
				dedupedCityList.push(value)
			}
		})

		const amount = dedupedCityList.length

		switch (true) {
			case amount === 0: {
				return null
			}
			case amount <= 2: {
				return dedupedCityList.join(` ${t('words.and')} `)
			}
			case amount === 3: {
				const commas = dedupedCityList.slice(0, 2)
				return [commas.join(', '), dedupedCityList[2]].join(` ${t('words.and')} `)
			}
			case amount > 3: {
				const visibleItems = dedupedCityList.slice(0, 3)
				const moreText = `${t('words.and-x-more', { count: dedupedCityList.length - visibleItems.length })}`
				return `${visibleItems.join(', ')} ${moreText}`
			}
		}
	}

	return (
		<>
			<Stack spacing={16} ref={hoverRef}>
				<Stack spacing={0}>
					<Group align='center' position='apart' noWrap>
						<Title
							order={2}
							className={classes.hoverText}
							data-hovered={hovered ? hovered : undefined}
							mb={12}
						>
							<Link
								href={{ pathname: '/org/[slug]', query: { slug } }}
								variant={variants.Link.inheritStyle}
								td='none'
							>
								{name}
								<Space w={4} display='inline-block' />
							</Link>
							{leaderBadgeGroup}
						</Title>
						<ActionButtons iconKey='save' organizationId={result.id} />
					</Group>
					<Link
						href={{ pathname: '/org/[slug]', query: { slug } }}
						variant={variants.Link.inheritStyle}
						td='none'
					>
						<Stack spacing={12}>
							<Text variant={variants.Text.utility2darkGray}>{cityList(locations)}</Text>
							{description && (
								<Text className={classes.description}>
									{t(description.key, { ns: result.id, defaultValue: description.text })}
								</Text>
							)}
						</Stack>
					</Link>
				</Stack>
				{communityFocusBadgeGroup}
				{serviceBadgeGroup}
			</Stack>
			<Divider my={40} />
		</>
	)
}

export const SearchResultCard = (props: SearchResultCardProps) =>
	props.loading ? <SearchResultLoading /> : <SearchResultData {...props} />

export type SearchResultCardProps = SearchResultHasData | SearchResultLoading

type SearchResultHasData = {
	result: NonNullable<ApiOutput['organization']['searchDistance']>['orgs'][number]
	loading?: false
}
type SearchResultLoading = {
	loading: true
	result?: never | NonNullable<ApiOutput['organization']['searchDistance']>['orgs'][number]
}
